const { build } = require('./lib/cli');
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

			const logSpy = jest.spyOn(process.stdout, 'write');

			await build(dir);

			expect(logSpy).not.toHaveBeenCalledWith(
				expect.stringContaining(
					'Failed to load prerenderUrls file, using default!'
				)
			);
		});

		formats.forEach(moduleFormat => {
			prerenderUrlFiles.forEach(dataFormat => {
				it(`should load the '${dataFormat}' file in ${moduleFormat}`, async () => {
					let dir = await subject('multiple-config-files');

					const logSpy = jest.spyOn(process.stdout, 'write');

					await build(dir, {
						prerenderUrls: `prerenderUrls/${moduleFormat}/${dataFormat}`,
					});

					expect(logSpy).not.toHaveBeenCalledWith(
						expect.stringContaining(
							'Failed to load prerenderUrls file, using default!'
						)
					);
				});
			});
		});
	});

	describe('preact.config', () => {
		formats.forEach(moduleFormat => {
			preactConfigFiles.forEach(dataFormat => {
				it(`should load the '${dataFormat}' file in ${moduleFormat}`, async () => {
					let dir = await subject('multiple-config-files');

					await expect(
						build(dir, { config: `preactConfig/${moduleFormat}/${dataFormat}` })
					).resolves.not.toThrow();
				});
			});
		});
	});
});
