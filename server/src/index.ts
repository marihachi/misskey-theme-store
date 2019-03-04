import argv from 'argv';
import start from './app/start';
import init from './app/init';

async function entryPoint() {

	// option args
	argv.option({
		name: 'init',
		type: 'boolean',
		description: 'initialize'
	});
	const { options } = argv.run();

	if (options.init) {
		await init();
		return;
	}

	await start();
}
entryPoint()
.catch(err => {
	console.error(err);
});
