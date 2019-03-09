import Express from 'express';
import IDocument from './core/IDocument';

declare global {
	namespace Express {
		interface Request {
			user: IDocument;
		}
	}
}
