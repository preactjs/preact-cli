import { resolve } from 'path';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import mkdirp from 'mkdirp';

const rm = promisify(rimraf);

export const outputPath = resolve(__dirname, '../output');

export const setup = () => mkdirp(outputPath);
export const clean = () => rm(outputPath);
