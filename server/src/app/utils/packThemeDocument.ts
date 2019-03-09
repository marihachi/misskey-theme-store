import IDocument from '../../core/IDocument';
import ServerContext from '../../core/ServerContext';

export default async function packThemeDocument(themeDoc: IDocument, serverContext: ServerContext) {
	const userDoc: IDocument = await serverContext.db.findById('users', themeDoc.userId);

	return {
		themeId: themeDoc._id.toHexString(),
		user: {
			userId: userDoc._id.toHexString(),
			username: userDoc.username,
		},
		name: themeDoc.name,
		description: themeDoc.description,
		imageUrl: themeDoc.imageUrl ? themeDoc.imageUrl : null
	}
}
