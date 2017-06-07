import { resolve } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import uuid from 'uuid/v4';
import run from './run';
import lsr from './lsr';

const rm = promisify(rimraf);
const listTemplate = async name => await lsr(resolve(__dirname, '../examples', name), ['.gitkeep', 'package.json']);
const listOutput = async (dir, name) => await lsr(resolve(dir, name), ['.gitkeep', 'package.json']);

describe('preact create', () => {
	let workDir = '';

	beforeEach(async () => {
		workDir = resolve(__dirname, 'output', uuid());
		await mkdirp(workDir);
	});

	afterEach(async () => {
		await rm(workDir);
	});

	it('should create project using full template by default.', async () => {
		let fullExample = await listTemplate('full');

		await run(['create', 'my-app', '--no-install'], workDir);
		let generated = await listOutput(workDir, 'my-app');

		expect(generated).toEqual(fullExample);
	});

	['root', 'simple', 'empty'].forEach(template =>
		it(`should create project using provided template. Verifying ${template}`, async () => {
			let example = await listTemplate(template);

			await run(['create', template, '--no-install', `--type=${template}`], workDir);
			let generated = await listOutput(workDir, template);

			expect(generated).toEqual(example);
		})
	);
});
