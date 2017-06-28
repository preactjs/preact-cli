import test from './async-test';
import { resolve } from 'path';
import fs from 'fs.promised';
import htmlLooksLike from 'html-looks-like';
import { create, build } from './lib/cli';
import lsr from './lib/lsr';
import { setup, clean, fromSubject } from './lib/output';
import expectedOutputs, { sassPrerendered } from './build.snapshot';
import filesMatchSnapshot from './lib/filesMatchSnapshot';

const options = { timeout: 45 * 1000 };

test('preact build - before', async () => {
	await setup();
});

['empty', 'simple', 'root', 'default'].forEach(template =>
	test(`preact build - should produce output. Veryfing ${template}`, options, async t => {
		let app = await create('app', template);
		await build(app);

		let output = await lsr(resolve(app, 'build'));

		filesMatchSnapshot(t, output, expectedOutputs[template]);
	})
);

test(`preact build - should prerender using webpack.`, options, async t => {
	let app = await fromSubject('sass');
	await build(app);

	let output = await fs.readFile(resolve(app, './build/index.html'), 'utf-8');
	let html = output.match(/<body>.*<\/body>/)[0];
	htmlLooksLike(html, sassPrerendered);
	t.pass();
});

test('preact build - after', async () => {
	await clean();
});
