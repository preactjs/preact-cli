const fs = require('fs');
const { relative, resolve } = require('path');
const { create } = require('./lib/cli');
const { expand } = require('./lib/utils');
const snapshots = require('./images/create');

// TODO: Move all `examples/` to `preactjs-templates`
const ours = ['default'];

describe('preact create', () => {
	ours.forEach(key => {
		it(`scaffolds the '${key}' official template`, async () => {
			let dir = await create(key);

			let output = await expand(dir).then(arr => {
				return arr.map(x => relative(dir, x));
			});

			expect(output.sort()).toEqual(snapshots[key]);
		});
	});

	it(`should use template.html from the github repo`, async () => {
		let dir = await create('netlify');

		const templateFilePath = resolve(__dirname, dir, 'src', 'template.html');
		const template = fs.readFileSync(templateFilePath).toString('utf8');

		expect(template.includes('twitter:card')).toEqual(true);
	});

	// it('should fail given an invalid name', async () => {
	// 	const exit = jest.spyOn(process, 'exit');
	// 	await create('default', '*()@!#!$-invalid-name');
	// 	expect(exit).toHaveBeenCalledWith(1);
	// });
});
