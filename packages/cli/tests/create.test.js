const { relative } = require('path');
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

	// it('should fail given an invalid name', async () => {
	// 	const exit = jest.spyOn(process, 'exit');
	// 	await create('default', '*()@!#!$-invalid-name');
	// 	expect(exit).toHaveBeenCalledWith(1);
	// });
});
