import path from 'path';
import Express from 'express';
//import passport from 'passport';
import mainRouter from './mainRouter';

const log = (...params: any[]) => {
	console.log('[Server]', ...params);
};

async function entryPoint() {

	log('initializing ...');

	// * parameters

	let httpPort = 3000;
	if (process.env.PORT) {
		httpPort = parseInt(process.env.PORT);
	}

	// * setup http server

	const app = Express();
	app.set('views', './views');
	app.set('view engine', 'pug');
	//app.use(passport.initialize());
	app.use(Express.static(path.resolve(__dirname, './frontend'), { etag: false }));

	// * routings

	app.get('/', (req, res) => {
		res.send('misskey theme store is developing now ;) comming soon ...');
	});

	app.use(mainRouter());

	log('initialized.');

	// * start http server

	app.listen(httpPort, () => {
		log('started http server.');
	});
}
entryPoint()
.catch(err => {
	console.error(err);
});
