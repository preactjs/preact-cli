const { join } = require('path');
const { readFile } = require('fs.promised');
const looksLike = require('html-looks-like');
const { create, build } = require('./lib/cli');
const { snapshot, isMatch } = require('./lib/utils');
const { subject } = require('./lib/output');
const images = require('./images/build');

// TODO
// const ours = ['empty', 'full', 'simple', 'root'];
const ours = ['default'];

async function getIndex(dir, file = 'index.html') {
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

describe('preact build', () => {
	ours.forEach(key =>
		it(`builds the '${key}' output`, async () => {
			let dir = await create(key);

			await build(dir);
			dir = join(dir, 'build');

			let output = await snapshot(dir);

			isMatch(output, images[key]);
		})
	);

	it('should use SASS styles', async () => {
		let dir = await subject('sass');
		await build(dir);

		let body = await getIndex(dir);
		looksLike(body, images.sass);
	});

	it('should use custom `.babelrc`', async () => {
		// app with custom .babelrc enabling async functions
		let app = await subject('custom-babelrc');
		// UglifyJS throws error when generator is encountered
		expect(async () => await build(app)).not;
	});

	it('should prerender the routes provided with `prerender-urls.json`', async () => {
		let dir = await subject('multiple-prerendering');
		await build(dir);

		const body1 = await getIndex(dir);
		looksLike(body1, images.prerender.home);

		const body2 = await getIndex(dir, 'route66/index.html');
		looksLike(body2, images.prerender.route);

		const head1 = await getHead(dir);
		expect(head1).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.prerender.heads.home))
		);

		const head2 = await getHead(dir, 'route66/index.html');
		expect(head2).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.prerender.heads.route66))
		);
	});

	it('should preload correct files', async () => {
		let dir = await subject('preload-chunks');
		await build(dir);

		const head1 = await getHead(dir);
		expect(head1).toEqual(
			expect.stringMatching(getRegExpFromMarkup(images.preload.head))
		);
	});

	it('should use custom `preact.config.js`', async () => {
		// app with custom template set via preact.config.js
		let dir = await subject('custom-webpack');
		await build(dir);

		let file = join(dir, 'build/index.html');
		let html = await readFile(file, 'utf-8');

		looksLike(html, images.webpack);
	});
});
