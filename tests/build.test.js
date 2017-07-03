import { resolve } from 'path';
import fs from 'fs.promised';
import htmlLooksLike from 'html-looks-like';
import { create, build } from './lib/cli';
import lsr from './lib/lsr';
import { setup, fromSubject } from './lib/output';
import expectedOutputs, { sassPrerendered, withCustomTemplate } from './build.snapshot';
import filesMatchSnapshot from './lib/filesMatchSnapshot';

describe('preact build', () => {
	beforeAll(async () => {
		await setup();
	});

	['empty', 'simple', 'root', 'default'].forEach(template =>
		it(`should produce output. Veryfing ${template}`, async () => {
			let app = await create('app', template);
			await build(app);

			let output = await lsr(resolve(app, 'build'));

			filesMatchSnapshot(output, expectedOutputs[template]);
		})
	);

	it(`should prerender using webpack.`, async () => {
		let app = await fromSubject('sass');
		await build(app);

		let output = await fs.readFile(resolve(app, './build/index.html'), 'utf-8');
		let html = output.match(/<body>.*<\/body>/)[0];
		htmlLooksLike(html, sassPrerendered);
	});

	it(`should use custom .babelrc.`, async () => {
		// app with custom .babelrc enabling async functions
		let app = await fromSubject('custom-babelrc');

		// UglifyJS throws error when generator is encountered
		expect(async () => await build(app)).not;
	});

	it(`should use custom preact.config.js.`, async () => {
		// app with custom template set via preact.config.js
		let app = await fromSubject('custom-webpack');

		await build(app);

		let html = await fs.readFile(resolve(app, './build/index.html'), 'utf-8');
		htmlLooksLike(html, withCustomTemplate);
	});
});
