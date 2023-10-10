const { access, readFile } = require('fs').promises;
const { join, relative } = require('path');
const { create } = require('../../cli/tests/lib/cli');
const { expand } = require('../../cli/tests/lib/utils');
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

	it('should use template.html from the repo if one exists', async () => {
		let dir = await create('netlify');

		const template = await readFile(join(dir, 'src/template.html'), 'utf8');

		expect(template.includes('twitter:card')).toEqual(true);
	});

	describe('CLI Options', () => {
		it('--name', async () => {
			let dir = await create('default', { name: 'renamed' });
			const manifest = await readFile(join(dir, 'src/manifest.json'), 'utf8');

			expect(JSON.parse(manifest).name).toBe('renamed');
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
