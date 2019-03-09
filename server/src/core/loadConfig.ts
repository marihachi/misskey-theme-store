import { promises as fs } from 'fs';
import JSON5 from 'json5';

export default async function loadConfig(filePath: string): Promise<any> {
	const content = await fs.readFile(filePath, 'utf8');
	return JSON5.parse(content);
}
