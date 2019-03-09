import path from 'path';
import $ from 'cafy';
import Express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import mongoStore from 'connect-mongo';
import passport from 'passport';
import JSON5 from 'json5';
import ServerContext from '../core/ServerContext';
import MongoProvider from '../core/MongoProvider';
import log from '../core/log';
import IDocument from '../core/IDocument';
import mainRouter from './mainRouter';
import IServerConfig from './IServerConfig';
import loadConfig from './utils/loadConfig';

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
		dbName: $.string,
		httpSessionSecret: $.string
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
	app.set('views', './views');
	app.set('view engine', 'pug');
	app.use(Express.static(path.resolve(__dirname, './frontend'), { etag: false }));
	app.use(bodyParser.json());
	const MongoStore = mongoStore(session);
	app.use(session({
		store: new MongoStore({ db: mongoDb.db }),
		secret: serverConfig.httpSessionSecret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7days
		}
	}));
	app.use(passport.initialize());
	app.use(passport.session());

	// * setup passport

	passport.serializeUser<IDocument, string>((user, done) => {
		done(null, user._id.toHexString());
	});
	passport.deserializeUser<IDocument, string>((id, done) => {
		async function findUser(): Promise<IDocument> {
			const userDoc: IDocument | undefined = await mongoDb.findById('users', id);
			if (!userDoc || userDoc.state == 'deleted') {
				throw new Error();
			}
			return userDoc;
		}
		findUser()
		.then(user => done(null, user))
		.catch(err => done(err));
	});

	// * routings

	app.get('/', (req, res) => {
		res.send('misskey theme store is developing now ;) comming soon ...');
	});
	app.use(mainRouter(serverContext));

	// * start http server

	app.listen(serverConfig.httpPort);

	log(`started listening on port ${serverConfig.httpPort}`);
}
