const { join } = require('path');
const { existsSync } = require('fs');
const { readFile } = require('fs').promises;
const looksLike = require('html-looks-like');
const { create, build } = require('./lib/cli');
const { snapshot, findMatchingKey } = require('./lib/utils');
const { subject } = require('./lib/output');
const images = require('./images/build');
const { promisify } = require('util');
const glob = promisify(require('glob').glob);

const prerenderUrlFiles = [
	'prerender-urls.json',
	'prerender-urls.js',
	'prerender-urls.promise.js',
];

async function getBody(dir, file = 'index.html') {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<body>.*<\/body>/)[0];
}

async function getHead(dir, file = 'index.html') {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<head>.*<\/head>/)[0];
}

function getRegExpFromMarkup(markup) {
	const minifiedMarkup = markup
		.replace(/\n/g, '')
		.replace(/\t/g, '')
		.replace(/\s{2}/g, '');
	return new RegExp(minifiedMarkup);
}

function testMatch(received, expected) {
	let receivedKeys = Object.keys(received);
	let expectedKeys = Object.keys(expected);
	expect(receivedKeys).toHaveLength(expectedKeys.length);
	for (let k in expected) {
		let recievedKey = findMatchingKey(k, receivedKeys);
		expect(recievedKey).toBeTruthy();
		expect(received[recievedKey]).toBeCloseTo(expected[k]);
	}
}

describe('preact build', () => {
	it(`builds the 'default' template`, async () => {
		let dir = await create('default');

		await build(dir);
		dir = join(dir, 'build');

		let output = await snapshot(dir);
		testMatch(output, images.default);
	});

	it(`builds the 'default' template with esm`, async () => {
		let dir = await create('default');

		await build(dir, { esm: true });
		dir = join(dir, 'build');

		let output = await snapshot(dir);
		testMatch(output, images['default-esm']);
	});

	it('should use SASS styles', async () => {
		let dir = await subject('sass');
		await build(dir);

		let body = await getBody(dir);
		looksLike(body, images.sass);
	});

	it('should use custom `.babelrc`', async () => {
		// app with custom .babelrc enabling async functions
		let app = await subject('custom-babelrc');

		await build(app);

		const bundleFiles = await glob(`${app}/build/bundle.*.js`);
		const transpiledChunk = await readFile(bundleFiles[0], 'utf8');

		// when tragetting only last 1 chrome version, babel preserves
		// arrow function. So checking for the delay function code from delay function in
		// https://github.com/preactjs/preact-cli/blob/master/packages/cli/tests/subjects/custom-babelrc/index.js
		expect(transpiledChunk.includes('=>setTimeout')).toBe(true);
	});

	prerenderUrlFiles.forEach(prerenderUrls => {
		it(`should prerender the routes provided with '${prerenderUrls}'`, async () => {
			let dir = await subject('multiple-prerendering');
			await build(dir, { prerenderUrls });

			const body1 = await getBody(dir);
			looksLike(body1, images.prerender.home);

			const body2 = await getBody(dir, 'route66/index.html');
			looksLike(body2, images.prerender.route);

			const body3 = await getBody(dir, 'custom/index.html');
			looksLike(body3, images.prerender.custom);

			const head1 = await getHead(dir);
			expect(head1).toEqual(
				expect.stringMatching(getRegExpFromMarkup(images.prerender.heads.home))
			);

			const head2 = await getHead(dir, 'route66/index.html');
			expect(head2).toEqual(
				expect.stringMatching(
					getRegExpFromMarkup(images.prerender.heads.route66)
				)
			);

			const head3 = await getHead(dir, 'custom/index.html');
			expect(head3).toEqual(
				expect.stringMatching(
					getRegExpFromMarkup(images.prerender.heads.custom)
				)
			);
		});
	});

	prerenderUrlFiles.forEach(prerenderUrls => {
		it(`should prerender the routes with data provided with '${prerenderUrls}' via provider`, async () => {
			let dir = await subject('multiple-prerendering-with-provider');
			await build(dir, { prerenderUrls });

			const body1 = await getBody(dir);
			looksLike(body1, images.prerender.home);

			const body2 = await getBody(dir, 'route66/index.html');
			looksLike(body2, images.prerender.route);

			const body3 = await getBody(dir, 'custom/index.html');
			looksLike(body3, images.prerender.custom);

			const body4 = await getBody(dir, 'customhook/index.html');
			looksLike(body4, images.prerender.customhook);

			const body5 = await getBody(dir, 'htmlsafe/index.html');
			looksLike(body5, images.prerender.htmlSafe);

			const head1 = await getHead(dir);
			expect(head1).toEqual(
				expect.stringMatching(getRegExpFromMarkup(images.prerender.heads.home))
			);

			const head2 = await getHead(dir, 'route66/index.html');
			expect(head2).toEqual(
				expect.stringMatching(
					getRegExpFromMarkup(images.prerender.heads.route66)
				)
			);

			const head3 = await getHead(dir, 'custom/index.html');
			expect(head3).toEqual(
				expect.stringMatching(
					getRegExpFromMarkup(images.prerender.heads.custom)
				)
			);
		});
	});

	it('should preload correct files', async () => {
		let dir = await subject('preload-chunks');
		await build(dir, { preload: true });

		const head1 = await getHead(dir);
		expect(head1).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.preload.head))
		);
	});

	it('should use custom `preact.config.js`', async () => {
		// app with stable output name via preact.config.js
		let dir = await subject('custom-webpack');
		await build(dir);

		let file = join(dir, 'build/bundle.js');
		expect(existsSync(file)).toBe(true);
	});

	it('should use template from the code folder', async () => {
		// app with custom template set via preact.config.js
		let dir = await subject('custom-template');
		await build(dir);

		let file = join(dir, 'build/index.html');
		let html = await readFile(file, 'utf-8');

		looksLike(html, images.template);
	});

	it('should patch global location object', async () => {
		let dir = await subject('location-patch');
		expect(() => build(dir)).not.toThrow();
	});

	it('should import non-modules CSS even when side effects are false', async () => {
		let dir = await subject('side-effect-css');
		await build(dir);

		let head = await getHead(dir);
		expect(head).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.sideEffectCss))
		);
	});

	it('should copy resources from static to build directory', async () => {
		let dir = await subject('static-root');
		await build(dir);
		let file = join(dir, 'build', '.htaccess');
		expect(existsSync(file)).toBe(true);
	});

	it('should inject preact.* variables into template', async () => {
		let dir = await subject('custom-template-2');
		await build(dir);

		let file = join(dir, 'build/index.html');
		let html = await readFile(file, 'utf-8');

		looksLike(html, images.templateReplaced);
	});

	it('should replace title with <%= preact.title %>', async () => {
		let dir = await subject('custom-template-3');
		await build(dir);

		let file = join(dir, 'build/index.html');
		let html = await readFile(file, 'utf-8');

		looksLike(html, images.templateReplaced);
	});

	it('should error out for invalid argument', async () => {
		let dir = await subject('custom-template-3');
		const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
		expect(build(dir, { 'service-worker': false })).rejects.toEqual(
			new Error('Invalid argument found.')
		);
		expect(mockExit).toHaveBeenCalledWith(1);
		mockExit.mockRestore();
	});
});
