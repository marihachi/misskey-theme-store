import { promises as fs } from 'fs';
import path from 'path';
import $ from 'cafy';
import { Router } from 'express';
import randomString from 'crypto-random-string';
import JSON5 from 'json5';
import ServerContext from '../core/ServerContext';
import buildHash from '../core/buildHash';
import IDocument from '../core/IDocument';
import log from '../core/log';
import { authentication } from './utils/session';
import { packTheme, packUserWithThemes } from './utils/packDocument';

export default function mainRouter(serverContext: ServerContext): Router {
	const { db } = serverContext;

	const authenticate = authentication(serverContext);
	const router = Router();

	// sign up
	router.post('/signup', async (req, res) => {

		// param: username
		const [username, usernameErr] = $.string.get(req.body.username);
		if (usernameErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		// param: password
		const [password, passwordErr] = $.string.get(req.body.password);
		if (passwordErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		if ((await db.count('users', { username: username })) != 0) {
			res.status(400).json({ error: { reason: 'already_in_use' } });
			return;
		}

		// TODO: delete the user of 'deleted' state

		const algorithm = 'sha256';
		const salt = randomString(16);
		const hash = buildHash(`${password}.${salt}`, algorithm);

		// token
		let tryCount = 1;
		let token = randomString(64);
		while (1) {
			if ((await db.count('users', { token: token })) == 0) {
				break;
			}
			token = randomString(64);
			tryCount++;
			if (tryCount > 10) {
				log('failed to generate token');
				res.status(500).json({ error: { reason: 'server_error' } });
				return;
			}
		}

		const userDoc: IDocument = await db.create('users', {
			username: username,
			password: {
				algorithm: algorithm,
				salt: salt,
				hash: hash
			},
			token: token,
			state: 'normal'
		});

		res.json({
			resultType: 'session',
			result: {
				userId: userDoc._id.toHexString(),
				token: token
			}
		});
	});

	// sign in
	router.post('/signin', async (req, res) => {

		// param: username
		const [username, usernameErr] = $.string.get(req.body.username);
		if (usernameErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		// param: password
		const [password, passwordErr] = $.string.get(req.body.password);
		if (passwordErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username,
			state: { $ne: 'deleted' }
		});

		if (!userDoc) {
			res.status(400).json({ error: { reason: 'incorrect_credentials' } });
			return;
		}

		if (userDoc.password.algorithm == 'sha256') {
			const correctHash = buildHash(`${password}.${userDoc.password.salt}`, 'sha256');
			if (userDoc.password.hash != correctHash) {
				res.status(400).json({ error: { reason: 'incorrect_credentials' } });
				return;
			}
		}
		else {
			log('unknown hash algorithm:', userDoc.password.algorithm);
			res.status(500).json({ error: { reason: 'server_error' } });
			return;
		}

		res.json({
			resultType: 'session',
			result: {
				userId: userDoc._id.toHexString(),
				token: userDoc.token
			}
		});
	});

	//#region User API

	// resolve username to userId
	router.post('/user/resolve', async (req, res) => {

		// param: username
		const [username, usernameErr] = $.string.get(req.body.username);
		if (usernameErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username,
			state: { $ne: 'deleted' }
		});

		if (!userDoc) {
			res.status(400).json({ error: { reason: 'user_not_found' } });
			return;
		}

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	// get user info by userId
	router.post('/user/get', async (req, res) => {

		// param: userId
		const [userId, userIdErr] = $.string.get(req.body.userId);
		if (userIdErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		const userDoc: IDocument | undefined = await db.findById('users', userId);
		if (!userDoc || userDoc.state == 'deleted') {
			res.status(400).json({ error: { reason: 'user_not_found' } });
			return;
		}

		res.json({
			resultType: 'userWithThemes',
			result: await packUserWithThemes(userDoc, serverContext)
		});
	});

	//#endregion User API

	//#region Theme API

	// register a theme from theme data
	router.post('/theme/register', authenticate, async (req, res) => {

		// param: themeData
		const [themeData, themeDataErr] = $.string.get(req.body.themeData);
		if (themeDataErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		let parsedThemeData;
		try {
			parsedThemeData = JSON5.parse(themeData);
		}
		catch (err) {
			res.status(400).json({ error: { reason: 'invalid_theme_data' } });
			return;
		}

		const themeDataValidation = $.object({
			name: $.string,
			desc: $.string,
			vars: $.object({
				primary: $.string,
				secondary: $.string,
				text: $.string
			})
		});
		if (themeDataValidation.nok(parsedThemeData)) {
			res.status(400).json({ error: { reason: 'invalid_theme_data' } });
			return;
		}

		// try to make dir
		try {
			await fs.mkdir(path.resolve(process.cwd(), 'themeFiles'));
		}
		catch { }

		// try to name an theme file
		let fileName: string = `${randomString(16)}.misskeytheme`;
		let fileNameTrying: number = 1;
		while (fileNameTrying <= 3) {
			try {
				const filePath: string = path.resolve(process.cwd(), 'themeFiles', fileName);
				await fs.writeFile(filePath, themeData, { flag: 'wx' });
				break;
			}
			catch (err) {
				console.error(err);
				fileName = `${randomString(16)}.png`;
				fileNameTrying ++;
			}
		}
		if (fileNameTrying > 3) {
			log('failed to write file');
			res.status(500).json({ error: { reason: 'server_error' } });
			return;
		}

		const themeDoc: IDocument = await db.create('themes', {
			userId: req.user._id,
			name: parsedThemeData.name,
			description: parsedThemeData.desc,
			themeFileName: fileName,
			imageFileName: null,
			state: 'normal',
			primaryColor: parsedThemeData.vars.primary,
			secondaryColor: parsedThemeData.vars.secondary,
			textColor: parsedThemeData.vars.text
		});

		res.json({
			resultType: 'theme',
			result: await packTheme(themeDoc, serverContext)
		});
	});

	// register a theme from theme data
	router.post('/theme/image/register', authenticate, async (req, res) => {

		// param: themeId
		const [themeId, themeIdErr] = $.string.get(req.body.themeId);
		if (themeIdErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		// param: imageData
		const [imageData, imageDataErr] = $.string.get(req.body.imageData);
		if (imageDataErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		// base64 size over
		if (imageData.length > 1.5 * 1024 * 1024) {
			res.status(400).json({ error: { reason: 'data_size_over' } });
			return;
		}

		let buf: Buffer;
		try {
			buf = Buffer.from(imageData, 'base64');
		}
		catch (err) {
			res.status(400).json({ error: { reason: 'invalid_image_data' } });
			return;
		}

		// buffer size over
		if (buf.byteLength > 1.0 * 1024 * 1024) {
			res.status(400).json({ error: { reason: 'data_size_over' } });
			return;
		}

		let themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.status(400).json({ error: { reason: 'theme_not_found' } });
			return;
		}

		if (!req.user._id.equals(themeDoc.userId)) {
			res.status(400).json({ error: { reason: 'not_your_theme' } });
			return;
		}

		// try to make dir
		try {
			await fs.mkdir(path.resolve(process.cwd(), 'themeImages'));
		}
		catch { }

		// try to name an image file
		let fileName: string = `${randomString(16)}.png`;
		let fileNameTrying: number = 1;
		while (fileNameTrying <= 3) {
			try {
				const filePath: string = path.resolve(process.cwd(), 'themeImages', fileName);
				await fs.writeFile(filePath, buf, { flag: 'wx' });
				break;
			}
			catch (err) {
				console.error(err);
				fileName = `${randomString(16)}.png`;
				fileNameTrying ++;
			}
		}
		if (fileNameTrying > 3) {
			log('failed to write file');
			res.status(500).json({ error: { reason: 'server_error' } });
			return;
		}

		const updatedDoc: IDocument = await db.updateById('themes', themeId, {
			imageFileName: fileName,
		});

		res.json({
			resultType: 'theme',
			result: await packTheme(updatedDoc, serverContext)
		});
	});

	// get a theme info by themeId
	router.post('/theme/get', async (req, res) => {

		// param: themeId
		const [themeId, themeIdErr] = $.string.get(req.body.themeId);
		if (themeIdErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		const themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.status(400).json({ error: { reason: 'theme_not_found' } });
			return;
		}

		res.json({
			resultType: 'theme',
			result: await packTheme(themeDoc, serverContext)
		});
	});

	// list theme infos in store
	router.post('/theme/list', async (req, res) => {
		const cursor: string | undefined = req.body.cursor;

		// TODO: cursor

		const themeDocs: IDocument[] = await serverContext.db.findArray('themes', {
			state: { $ne: 'deleted' }
		}, { isAscending: false });

		const packedThemePromises = themeDocs.map(themeDoc => packTheme(themeDoc, serverContext));
		const packedThemes = await Promise.all(packedThemePromises);

		res.json({
			resultType: 'themes',
			result: packedThemes
		});
	});

	// update a theme info by themeId
	router.post('/theme/update', authenticate, async (req, res) => {

		// param: themeId
		const [themeId, themeIdErr] = $.string.get(req.body.themeId);
		if (themeIdErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		// param: description
		const [description, descriptionErr] = $.string.optional.nullable.get(req.body.description) as [string | undefined, Error];
		if (descriptionErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		if (!description) {
			res.status(400).json({ error: { reason: 'not_updated' } });
			return;
		}

		let themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.status(400).json({ error: { reason: 'theme_not_found' } });
			return;
		}

		if (!req.user._id.equals(themeDoc.userId)) {
			res.status(400).json({ error: { reason: 'not_your_theme' } });
			return;
		}

		const updateQuery: { [x: string]: any } = {};
		if (description) {
			updateQuery.description = description;
		}

		themeDoc = (await db.updateById('themes', themeId, updateQuery)) as IDocument;

		res.json({
			resultType: 'theme',
			result: await packTheme(themeDoc, serverContext)
		});
	});

	// remove a theme info by themeId
	router.post('/theme/delete', authenticate, async (req, res) => {

		// param: themeId
		const [themeId, themeIdErr] = $.string.get(req.body.themeId);
		if (themeIdErr) {
			res.status(400).json({ error: { reason: 'invalid_param' } });
			return;
		}

		const themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.status(400).json({ error: { reason: 'theme_not_found' } });
			return;
		}

		if (!req.user._id.equals(themeDoc.userId)) {
			res.status(400).json({ error: { reason: 'not_your_theme' } });
			return;
		}

		await db.updateById('themes', themeId, { state: 'deleted' });

		res.json({
			resultType: 'empty',
			result: { }
		});
	});

	//#endregion Theme API

	return router;
}
