import MongoProvider from './MongoProvider';

export default interface ServerContext {
	db: MongoProvider;
}
