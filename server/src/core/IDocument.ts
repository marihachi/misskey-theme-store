import { ObjectId } from 'mongodb';

export default interface IDocument {
	[x: string]: any;
	_id: ObjectId;
}
