const { readFile } = require('fs/promises');
const { relative, resolve } = require('path');
const { create } = require('../../cli/tests/lib/cli');
const { expand } = require('../../cli/tests/lib/utils');
const snapshots = require('./images/create');

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

		const templateFilePath = resolve(__dirname, dir, 'src', 'template.html');
		const template = await readFile(templateFilePath, 'utf8');

		expect(template.includes('twitter:card')).toEqual(true);
	});
});
