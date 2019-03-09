import $ from 'cafy';
import { Request, Response, NextFunction } from 'express';
import ServerContext from '../../core/ServerContext';

export function authentication(serverContext: ServerContext) {
	const { db } = serverContext;

	function authenticate(req: Request, res: Response, next: NextFunction) {
		(async () => {
			const [token, tokenErr] = $.string.get(req.body.token);
			if (tokenErr) {
				res.status(400).json({ error: { reason: 'need_login' } });
				return;
			}
			const user = await db.find('users', { token: token, state: { $ne: 'deleted' } });
			if (!user) {
				res.status(400).json({ error: { reason: 'need_login' } });
				return;
			}
			req.user = user;
			next();
		})()
		.catch(err => next(err))
	}

	return authenticate;
}
