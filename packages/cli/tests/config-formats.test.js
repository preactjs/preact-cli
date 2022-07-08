const { join } = require('path');
const { access } = require('fs').promises;
const { build, buildFast } = require('./lib/cli');
const { subject } = require('./lib/output');

const formats = ['cjs', 'esm'];

const prerenderUrlFiles = [
	'array.js',
	'stringified-array.js',
	'function-returning-array.js',
	'function-returning-stringified-array.js',
];

const preactConfigFiles = ['function.js', 'object.js'];

describe('config files', () => {
	describe('prerender-urls', () => {
		it(`should load the 'prerender-urls.json' file`, async () => {
			let dir = await subject('multiple-config-files');

			await buildFast(dir);

			expect(await access(join(dir, 'build/index.html'))).toBeUndefined();
			expect(
				await access(join(dir, 'build/custom/index.html'))
			).toBeUndefined();
		});

		formats.forEach(moduleFormat => {
			prerenderUrlFiles.forEach(dataFormat => {
				it(`should load the '${dataFormat}' file in ${moduleFormat}`, async () => {
					let dir = await subject('multiple-config-files');

					await buildFast(dir, {
						prerenderUrls: `prerenderUrls/${moduleFormat}/${dataFormat}`,
					});

					expect(await access(join(dir, 'build/index.html'))).toBeUndefined();
					expect(
						await access(join(dir, 'build/custom/index.html'))
					).toBeUndefined();
				});
			});
		});
	});

	describe('preact.config', () => {
		formats.forEach(moduleFormat => {
			preactConfigFiles.forEach(dataFormat => {
				it(`should load the '${dataFormat}' file in ${moduleFormat}`, async () => {
					let dir = await subject('multiple-config-files');

					await build(dir, {
						config: `preactConfig/${moduleFormat}/${dataFormat}`,
					});

					expect(await access(join(dir, 'build/bundle.js'))).toBeUndefined();
				});
			});
		});
	});
});
