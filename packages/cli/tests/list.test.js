const { join } = require('path');
const shell = require('shelljs');

describe('preact list', () => {
	it('lists the official templates', () => {
		const { code, stdout } = shell.exec(
			`node ${join(__dirname, '../src/index.js')} list`
		);
		[
			'default',
			'netlify',
			'simple',
			'typescript',
			'widget',
			'widget-typescript',
		].forEach(repoName => {
			expect(stdout).toMatch(new RegExp(`${repoName}.* -`, 'g'));
		});
		expect(code).toBe(0);
	});
});
