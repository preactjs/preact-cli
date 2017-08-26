import ncp from 'ncp';
import uuid from 'uuid/v4';
import { resolve } from 'path';
import { promisify } from 'bluebird';
import spawn from 'cross-spawn-promise';
import { log } from './utils';

const copy = promisify(ncp);
const output = resolve(__dirname, '../output');
const subjects = resolve(__dirname, '../subjects');

export const tmpDir = () => resolve(output, uuid());

export async function fromSubject(name) {
	let dest = tmpDir();
	let dir = resolve(subjects, name);

	await log(() => copy(dir, dest), `Copy subject: ${name}`);

	// always install deps; needs to build
	await log(() => spawn('npm', ['install'], { cwd:dest }), `Install subject dependencies`);

	return dest;
}
