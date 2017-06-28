import { resolve } from 'path';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import mkdirp from 'mkdirp';
import uuid from 'uuid/v4';
import ncp from 'ncp';

const rm = promisify(rimraf);
const cp = promisify(ncp);

export const outputPath = resolve(__dirname, '../output');
const subjectsPath = resolve(__dirname, '../subjects');

export const setup = () => mkdirp(outputPath);
export const clean = () => rm(outputPath);

export const createWorkDir = () => resolve(outputPath, uuid());

export const fromSubject = async (subjectName) => {
	let workDir = createWorkDir();
	await cp(resolve(subjectsPath, subjectName), workDir);
	return workDir;
};
