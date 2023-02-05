const { access, readFile } = require('fs').promises;
const { join } = require('path');
const { create } = require('./lib/cli');
const { snapshotDir } = require('./lib/utils');
const shell = require('shelljs');
const dirTree = require('directory-tree');

describe('preact create', () => {
	it('scaffolds the `default` official template', async () => {
		let dir = await create('default');

		const directoryTree = dirTree(dir, {
			exclude: /node_modules|package-lock|yarn.lock/,
		});

		// Creating a stable name, as the test directory is normally a randomized string
		directoryTree.name = 'default-template-project';

		expect(await snapshotDir([directoryTree], false)).toMatchSnapshot();
	});

	it('should use template.html from the github repo', async () => {
		let dir = await create('netlify');
		const template = await readFile(join(dir, 'src/template.html'), 'utf8');
		expect(template.includes('twitter:card')).toEqual(true);
	});

	describe('CLI Options', () => {
		it('--name', async () => {
			let dir = await create('simple', { name: 'renamed' });
			const packageJson = await readFile(join(dir, 'package.json'), 'utf8');

			expect(JSON.parse(packageJson).name).toBe('renamed');

			// @ts-ignore
			const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
			await create('simple', { name: '*()@!#!$-Invalid-Name' });
			expect(mockExit).toHaveBeenCalledWith(1);
			mockExit.mockRestore();
		});

		it('--git', async () => {
			let dir = await create('simple', { git: true });
			expect(await access(join(dir, '.git'))).toBeUndefined();

			dir = await create('simple', { git: false });
			await expect(access(join(dir, '.git'))).rejects.toThrow(
				'no such file or directory'
			);
		});

		it('--invalid-arg', () => {
			const { code, stderr } = shell.exec(
				`node ${join(__dirname, '../src/index.js')} create --invalid-arg`
			);
			expect(stderr).toMatch(
				"Invalid argument '--invalid-arg' passed to create."
			);
			expect(code).toBe(1);
		});
	});
});
