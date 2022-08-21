const { join } = require('path');
const shell = require('shelljs');
const { subject } = require('./lib/output');

describe('preact info', () => {
	it('--src', async () => {
		let dir = await subject('minimal');
		// env-info does not pick up on symlinks, so we need to install deps
		shell.exec(`npm --prefix ${dir} i preact preact-render-to-string`);

		const _cwd = process.cwd();

		shell.cd(dir);
		const { code, stdout } = shell.exec(
			`node ${join(__dirname, '../src/index.js')} info`
		);
		['OS', 'Node', 'preact', 'preact-render-to-string'].forEach(label => {
			expect(stdout).toMatch(`${label}:`);
		});
		expect(code).toBe(0);

		shell.cd(_cwd);
	});
});
