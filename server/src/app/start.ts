import path from 'path';
import $ from 'cafy';
import Express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import JSON5 from 'json5';
import ServerContext from '../core/ServerContext';
import MongoProvider from '../core/MongoProvider';
import log from '../core/log';
import loadConfig from '../core/loadConfig';
import router from './router';
import IServerConfig from './IServerConfig';

export default async function start() {

	console.log("    __  ____           __               ________                         _____ __                ");
	console.log("   /  |/  (_)_________/ /_____  __  __ /_  __/ /_  ___  ____ ___  ___   / ___// /_____  ________ ");
	console.log("  / /|_/ / / ___/ ___/ //_/ _ \\/ / / /  / / / __ \\/ _ \\/ __ `__ \\/ _ \\  \\__ \\/ __/ __ \\/ ___/ _ \\");
	console.log(" / /  / / (__  |__  ) ,< /  __/ /_/ /  / / / / / /  __/ / / / / /  __/ ___/ / /_/ /_/ / /  /  __/");
	console.log("/_/  /_/_/____/____/_/|_|\\___/\\__, /  /_/ /_/ /_/\\___/_/ /_/ /_/\\___/ /____/\\__/\\____/_/   \\___/ ");
	console.log("                             /____/                                                                ");

	// * config

	// load config
	let serverConfigSource: any;
	if (process.env.MTS_CONFIG != null) {
		log(`loading config from MTS_CONFIG env variable ...`);
		serverConfigSource = JSON5.parse(process.env.MTS_CONFIG);
	}
	else {
		log(`loading config from .configs/mtsConfig.json5 ...`);
		serverConfigSource = await loadConfig(path.resolve(process.cwd(), `./.configs/mtsConfig.json5`));
	}
	serverConfigSource.httpPort = 3000;
	if (process.env.PORT) {
		const envPort = parseInt(process.env.PORT);
		if (!Number.isNaN(envPort)) {
			serverConfigSource.httpPort = envPort;
		}
	}
	const serverConfig: IServerConfig = serverConfigSource;

	// verify config
	const serverConfigVerification = $.obj({
		httpPort: $.number,
		dbUrl: $.string,
		dbName: $.string
	});
	if (serverConfigVerification.nok(serverConfig)) {
		throw new Error('invalid config');
	}

	// * database

	log(`connecting database ...`);
	const mongoDb = await MongoProvider.connect(serverConfig.dbUrl, serverConfig.dbName);

	// * server context

	const serverContext: ServerContext = {
		db: mongoDb
	};

	// * setup http server

	const app = Express();
	app.set('views', path.resolve(__dirname, './views'));
	app.set('view engine', 'pug');
	app.use(bodyParser.json({ limit: '3MB' }));

	// routings

	app.use('/', Express.static(path.resolve(__dirname, '../client/scripts'), { etag: false }));
	app.use('/', Express.static(path.resolve(__dirname, '../client/pages'), { etag: false }));
	app.use('/theme/file', Express.static(path.resolve(process.cwd(), 'themeFiles'), { etag: false }));
	app.use('/theme/image', Express.static(path.resolve(process.cwd(), 'themeImages'), { etag: false }));
	app.use(router(serverContext));

	// not found
	app.post('*', (req, res) => {
		res.status(400).json({ error: { reason: 'endpoint_not_found' } });
	});
	app.use((req, res) => {
		res.render('main');
	});

	// error handling
	app.use((err: any, req: Request, res: Response, next: NextFunction) => {
		if (err instanceof SyntaxError) {
			res.status(400).json({ error: { reason: 'invalid_json' } });
			return;
		}
		log('http server error:', err);
		res.status(500).json({ error: { reason: 'server_error' } });
	});

	// * start http server

	app.listen(serverConfig.httpPort);

	log(`started listening on port ${serverConfig.httpPort}`);
}
