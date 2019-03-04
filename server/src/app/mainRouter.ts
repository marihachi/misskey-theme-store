import { promises as fs } from 'fs';
import path from 'path';
import { Router } from 'express';
import randomString from 'crypto-random-string';
import JSON5 from 'json5';
import ServerContext from '../core/ServerContext';
import buildHash from '../core/buildHash';
import IDocument from '../core/IDocument';
import log from '../core/log';
import packUserDocument from './utils/packUserDocument';
import packThemeDocument from './utils/packThemeDocument';
import { setSession, clearSession } from './utils/session';

export default function mainRouter(serverContext: ServerContext): Router {
	const { db } = serverContext;

	const router = Router();

	// sign up
	router.post('/signup', async (req, res) => {
		const username: string = req.body.username;
		const password: string = req.body.password;

		if (await db.find('user', { username: username })) {
			res.json({ error: { reason: 'already_in_use'} });
			return;
		}

		const algorithm = 'sha256';
		const salt = randomString(16);
		const hash = buildHash(`${password}.${salt}`, algorithm);

		const userDoc: IDocument = await db.create('users', {
			username: username,
			password: {
				algorithm: algorithm,
				salt: salt,
				hash: hash
			},
			state: 'normal'
		});

		await setSession(req, userDoc);

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	// sign in
	router.post('/signin', async (req, res) => {
		const username: string = req.body.username;
		const password: string = req.body.password;

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username,
			state: { $ne: 'deleted' }
		});

		if (!userDoc) {
			res.json({ error: { reason: 'incorrect_credentials' } });
			return;
		}

		if (userDoc.password.algorithm == 'sha256') {
			const correctHash = buildHash(`${password}.${userDoc.password.salt}`, 'sha256');
			if (userDoc.password.hash != correctHash) {
				res.json({ error: { reason: 'incorrect_credentials' } });
				return;
			}
		}
		else {
			log('unknown hash algorithm:', userDoc.password.algorithm);
			res.json({ error: { reason: 'server_error' } });
			return;
		}

		await setSession(req, userDoc);

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	router.post('/signout', async (req, res) => {
		clearSession(req);
		res.json({
			resultType: 'empty',
			result: {}
		});
	});

	// resolve username to userId
	router.post('/user/resolve', async (req, res) => {
		const username: string = req.body.username;

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username,
			state: { $ne: 'deleted' }
		});

		if (!userDoc) {
			res.json({ error: { reason: 'user_not_found' } });
			return;
		}

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	// get user info by userId
	router.post('/user/get', async (req, res) => {
		const userId: string = req.body.userId;
		
		const userDoc: IDocument | undefined = await db.findById('users', userId);
		if (!userDoc || userDoc.state == 'deleted') {
			res.json({ error: { reason: 'user_not_found' } });
			return;
		}

		res.json({
			resultType: 'user',
			result: await packUserDocument(userDoc, serverContext)
		});
	});

	// register a theme from theme data
	router.post('/theme/register', async (req, res) => {
		const themeData: string = req.body.themeData;

		let parsedThemeData;
		try {
			parsedThemeData = JSON5.parse(themeData);
		}
		catch (err) {
			res.json({ error: { reason: 'invalid_theme_data' } });
			return;
		}

		const themeDoc: IDocument = await db.create('themes', {
			name: parsedThemeData.name,
			description: parsedThemeData.description,
			imageUrl: null,
			state: 'normal'
		});

		res.json({
			resultType: 'theme',
			result: packThemeDocument(themeDoc)
		});
	});

	// register a theme from theme data
	router.post('/theme/image/register', async (req, res) => {
		const themeId: string = req.body.themeId;
		const imageData: string = req.body.imageData;

		// base64 size over
		if (imageData.length > 1.5 * 1024 * 1024) {
			res.json({ error: { reason: 'data_size_over' } });
			return;
		}

		let buf: Buffer;
		try {
			buf = Buffer.from(imageData, 'base64');
		}
		catch (err) {
			res.json({ error: { reason: 'invalid_image_data' } });
			return;
		}

		// buffer size over
		if (buf.byteLength > 1.0 * 1024 * 1024) {
			res.json({ error: { reason: 'data_size_over' } });
			return;
		}

		let themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.json({ error: { reason: 'theme_not_found' } });
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
			res.json({ error: { reason: 'server_error' } });
			return;
		}

		const imageUrl = `/theme/image/${fileName}`;

		const updatedDoc: IDocument = await db.updateById('themes', themeId, {
			imageUrl: imageUrl,
		});

		res.json({
			resultType: 'theme',
			result: packThemeDocument(updatedDoc)
		});
	});

	// get a theme info by themeId
	router.post('/theme/get', async (req, res) => {
		const themeId: string = req.body.themeId;

		const themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.json({ error: { reason: 'theme_not_found' } });
			return;
		}

		res.json({
			resultType: 'theme',
			result: packThemeDocument(themeDoc)
		});
	});

	// list theme infos in store
	router.post('/theme/list', async (req, res) => {
		const cursor: string | undefined = req.body.cursor;

		// TODO: cursor

		const themeDocs: IDocument[] = await serverContext.db.findArray('themes', {
			state: { $ne: 'deleted' }
		});

		const packedThemes = themeDocs.map(themeDoc => packThemeDocument(themeDoc));

		res.json({
			resultType: 'themes',
			result: packedThemes
		});
	});

	// update a theme info by themeId
	router.post('/theme/update', async (req, res) => {
		const themeId: string = req.body.themeId;
		const description: string | undefined = req.body.description;

		if (!description) {
			res.json({ error: { reason: 'not_updated' } });
			return;
		}

		let themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.json({ error: { reason: 'theme_not_found' } });
			return;
		}

		const updateQuery: { [x: string]: any } = {};
		if (description) {
			updateQuery.description = description;
		}

		themeDoc = (await db.updateById('themes', themeId, updateQuery)) as IDocument;

		res.json({
			resultType: 'theme',
			result: packThemeDocument(themeDoc)
		});
	});

	// remove a theme info by themeId
	router.post('/theme/delete', async (req, res) => {
		const themeId: string = req.body.themeId;

		const themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc || themeDoc.state == 'deleted') {
			res.json({ error: { reason: 'theme_not_found' } });
			return;
		}

		await db.updateById('themes', themeId, { state: 'deleted' });

		res.json({
			resultType: 'empty',
			result: { }
		});
	});

	return router;
}
