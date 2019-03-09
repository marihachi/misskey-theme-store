import path from 'path';
import { promises as fs } from 'fs';
import JSON5 from 'json5';
import log from '../core/log';
import question from '../core/question';
import inputLine from '../core/inputLine';
import IServerConfig from './IServerConfig';

export default async function init() {

	// try to make dir
	try {
		await fs.mkdir(path.resolve(process.cwd(), `./.configs`));
	}
	catch { }

	const configPath = path.resolve(process.cwd(), `./.configs/mtsConfig.json5`);

	let isFileExisting;
	try {
		await fs.access(configPath);
		isFileExisting = true;
	}
	catch (err) {
		isFileExisting = false;
	}

	if (isFileExisting) {
		const overwriteResult = await question('.configs/mtsConfig.json5 will be overwritten, is it okay? (y/n) > ');
		if (!overwriteResult) {
			log('cancel initialization.');
			return;
		}
	}

	let httpPort: number = 3000;
	while (1) {
		const httpPortSource = await inputLine('input your http port number (default:3000) > ');
		if (httpPortSource == '') break;
		httpPort = parseInt(httpPortSource);
		if (!Number.isNaN(httpPort)) {
			break;
		}
		log('error: input data is not number');
	}
	const dbUrl = await inputLine('input your MongoDB url > ');
	const dbName = await inputLine('input your db name of MongoDB > ');

	const serverConfig: IServerConfig = {
		httpPort: httpPort,
		dbName: dbName,
		dbUrl: dbUrl
	}
	const serializedConfig = JSON5.stringify(serverConfig, { space: 2 });
	try {
		await fs.writeFile(configPath, serializedConfig);
	}
	catch (err) {
		console.error('failed to write config file');
	}
	log('initialization succeeded');
}
