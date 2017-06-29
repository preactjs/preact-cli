import { resolve } from 'path';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import mkdirp from 'mkdirp';
import withLog from './log';

const rm = promisify(rimraf);

export const outputPath = resolve(__dirname, '../output');

export const setup = () => withLog(() => mkdirp(outputPath), 'Setup');
export const clean = () => withLog(() => rm(outputPath), 'Clean');
