import copy from 'ncp';
import uuid from 'uuid/v4';
import { resolve } from 'path';
import { promisify } from 'bluebird';

const output = resolve(__dirname, '../output');
const subjects = resolve(__dirname, '../subjects');

export const tmpDir = () => resolve(output, uuid());

export async function subject(name) {
	let src = resolve(subjects, name);
	let dest = tmpDir();
	await promisify(copy)(src, dest);
	return dest;
}
