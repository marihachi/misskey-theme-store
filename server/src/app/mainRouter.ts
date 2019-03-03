import { Router } from 'express';
import randomString from 'crypto-random-string';
import ServerContext from '../core/ServerContext';
import buildHash from '../core/buildHash';
import IDocument from '../core/IDocument';
import log from '../core/log';
import packUserDocument from './utils/packUserDocument';
import packThemeDocument from './utils/packThemeDocument';

export default function mainRouter(serverContext: ServerContext): Router {
	const { db } = serverContext;

	const router = Router();

	// sign up
	router.post('/signup', async (req, res) => {
		const username = req.body.username;
		const password = req.body.password;

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
			}
		});

		// TODO: set session

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	// sign in
	router.post('/signin', async (req, res) => {
		const username = req.body.username;
		const password = req.body.password;

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username
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

		// TODO: set session

		res.json({
			resultType: 'userId',
			result: userDoc._id.toHexString()
		});
	});

	// resolve username to userId
	router.post('/user/resolve', async (req, res) => {
		const username = req.body.username;

		const userDoc: IDocument | undefined = await db.find('users', {
			username: username
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

	// get user data by userId
	router.post('/user', async (req, res) => {
		const userId = req.body.userId;
		
		const userDoc: IDocument | undefined = await db.findById('users', userId);
		if (!userDoc) {
			res.json({ error: { reason: 'user_not_found' } });
			return;
		}

		res.json({
			resultType: 'user',
			result: await packUserDocument(userDoc, serverContext)
		});
	});

	// get theme data by themeId
	router.post('/theme', async (req, res) => {
		const themeId = req.body.themeId;

		const themeDoc: IDocument | undefined = await db.findById('themes', themeId);
		if (!themeDoc) {
			res.json({ error: { reason: 'theme_not_found' } });
			return;
		}

		res.json({
			resultType: 'theme',
			result: packThemeDocument(themeDoc)
		});
	});

	// list theme data in store
	router.post('/theme/list', async (req, res) => {

		// TODO: cursor

		const themeDocs: IDocument[] = await serverContext.db.findArray('themes', { });

		const packedThemes = themeDocs.map(themeDoc => packThemeDocument(themeDoc));

		res.json({
			resultType: 'themes',
			result: packedThemes
		});
	});

	return router;
}
