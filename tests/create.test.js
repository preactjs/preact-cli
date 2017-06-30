import test from 'tape-async';
import { resolve } from 'path';
import { create } from './lib/cli';
import lsr from './lib/lsr';
import { setup, clean } from './lib/output';

const options = { timeout: 120 * 1000 };

const listTemplate = async dir => await lsr(resolve(__dirname, '../examples', dir), ['.gitkeep', 'package.json']);
const listOutput = async dir => await lsr(dir, ['.gitkeep', 'package.json', 'package-lock.json', 'node_modules']);

test('preact create - before', options, async () => {
	await setup();
});

test('preact create - should create project using full template by default.', options, async t => {
	let fullExample = await listTemplate('full');
	let app = await create('app');
	let generated = await listOutput(app);

	t.isEquivalent(generated, fullExample);
});

['root', 'simple', 'empty'].forEach(template =>
	test(`preact create - should create project using provided template. Verifying ${template}`, options, async t => {
		let example = await listTemplate(template);
		let app = await create('app', template);
		let generated = await listOutput(app);

		t.isEquivalent(generated, example);
	})
);

test('preact build - after', options, async () => {
	await clean();
});
