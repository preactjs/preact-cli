import { resolve } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import uuid from 'uuid/v4';
import run from './run';

const rm = promisify(rimraf);

describe('preact build', () => {
	let workDir = '';

	beforeEach(async () => {
		workDir = resolve(__dirname, 'output', uuid());
		await mkdirp(workDir);
	});

	afterEach(async () => {
		await rm(workDir);
	});

	['empty', 'simple', 'root', 'default'].forEach(template =>
		it(`should build generated projects without errors. Veryfing ${template}`, async () => {
			await run(['create', template, '--no-install', `--type=${template}`], workDir);
			await run(['build'], resolve(workDir, template));
		})
	);
});
