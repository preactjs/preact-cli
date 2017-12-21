import mkdir from 'mkdirp';
import { join } from 'path';
import { readFile } from 'fs.promised';
import looksLike from 'html-looks-like';
import { create, build } from './lib/cli';
import { snapshot, isMatch } from './lib/utils';
import { subject } from './lib/output';
import images from './images/build';

// TODO
// const ours = ['empty', 'full', 'simple', 'root'];
const ours = ['default'];

async function getIndex(dir, file='index.html') {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<body>.*<\/body>/)[0];
}

describe('preact build', () => {
	ours.forEach(key =>
		it(`builds the '${key}' output`, async () => {
			let dir = await create(key);

			// create empty dir, avoids exit()
			mkdir.sync(join(dir, 'node_modules'));

			await build(dir);
			dir = join(dir, 'build');

			let output = await snapshot(dir);

			isMatch(output, images[key]);
		})
	);

	it('should prerender using webpack', async () => {
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

		let body1 = await getIndex(dir);
		looksLike(body1, images.prerender.home);

		let body2 = await getIndex(dir, 'route66/index.html');
		looksLike(body2, images.prerender.route);
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
