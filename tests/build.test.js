import { join } from 'path';
import { readFile } from 'fs.promised';
import looksLike from 'html-looks-like';
import { create, build } from './lib/cli';
import { snapshot, isMatch } from './lib/utils';
import { fromSubject } from './lib/output';
import images from './images/build';

// TODO
// const ours = ['empty', 'full', 'simple', 'root'];
const ours = ['default'];

async function getBody(dir, file) {
	file = join(dir, `build/${file}`);
	let html = await readFile(file, 'utf-8');
	return html.match(/<body>.*<\/body>/)[0];
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

	it('should prerender using webpack', async () => {
		let dir = await fromSubject('sass');
		await build(dir);

		let body = await getBody(dir, 'index.html');
		looksLike(body, images.sass);
	});

	it('should use custom `.babelrc`', async () => {
		// app with custom .babelrc enabling async functions
		let app = await fromSubject('custom-babelrc');

		// UglifyJS throws error when generator is encountered
		expect(async () => await build(app)).not;
	});

	it('should prerender the routes provided with `prerender-urls.json`', async () => {
		let dir = await fromSubject('multiple-prerendering');
		await build(dir);

		let body1 = await getBody(dir, 'index.html');
		looksLike(body1, images.prerender.home);

		let body2 = await getBody(dir, 'route66/index.html');
		looksLike(body2, images.prerender.route);
	});

	it('should use custom `preact.config.js`', async () => {
		// app with custom template set via preact.config.js
		let dir = await fromSubject('custom-webpack');
		await build(dir);

		let file = join(dir, 'build/index.html');
		let html = await readFile(file, 'utf-8');

		looksLike(html, images.webpack);
	});
});
