import { Request } from 'express';
import IDocument from '../../core/IDocument';

export function setSession(req: Request, user: IDocument): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		req.login(user, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

export function clearSession(req: Request): void {
	req.logout();
}
