import { resolve } from 'path';
import promisify from 'es6-promisify';
import mkdirp from 'mkdirp';
import uuid from 'uuid/v4';
import ncp from 'ncp';
import spawn from 'cross-spawn-promise';
import { withLog } from './utils';
import { shouldInstallDeps } from './tests-config';

const cp = promisify(ncp);

export const outputPath = resolve(__dirname, '../output');
const subjectsPath = resolve(__dirname, '../subjects');

export const setup = () => withLog(() => mkdirp(outputPath), 'Setup');

export const createWorkDir = () => resolve(outputPath, uuid());

export const fromSubject = async (subjectName) => {
	let workDir = createWorkDir();
	await withLog(() => cp(resolve(subjectsPath, subjectName), workDir), `Copy subject: ${subjectName}`);

	if (shouldInstallDeps()) {
		await withLog(() => spawn('npm', ['install'], { cwd: workDir }), `Install subject dependencies`);
	}

	return workDir;
};
