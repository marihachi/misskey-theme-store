import IDocument from '../../core/IDocument';

export default function packThemeDocument(themeDoc: IDocument) {
	return {
		themeId: themeDoc._id.toHexString(),
		name: themeDoc.name,
		description: themeDoc.description,
		imageUrl: null // TODO
	}
}
