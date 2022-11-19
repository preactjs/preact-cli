const { access, readFile } = require('fs').promises;
const { join, relative } = require('path');
const { create } = require('./lib/cli');
const { expand } = require('./lib/utils');
const snapshots = require('./images/create');
const shell = require('shelljs');

describe('preact create', () => {
	it('scaffolds the `default` official template', async () => {
		let dir = await create('default');

		let output = await expand(dir).then(arr => {
			return arr.map(x => relative(dir, x));
		});

		expect(output.sort()).toEqual(snapshots.default);
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
