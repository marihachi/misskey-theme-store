import ServerContext from '../../core/ServerContext';
import IDocument from '../../core/IDocument';
import packThemeDocument from './packThemeDocument';

export default async function packUserDocument(userDoc: IDocument, serverContext: ServerContext) {
	const themeDocs: IDocument[] = await serverContext.db.findArray('themes', {
		userId: userDoc._id
	});
	const packedThemes = themeDocs.map(themeDoc => packThemeDocument(themeDoc, serverContext));

	return {
		userId: userDoc._id.toHexString(),
		username: userDoc.username,
		themes: packedThemes
	};
}
