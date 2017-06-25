import test from './async-test';
import { resolve } from 'path';
import { create } from './lib/cli';
import lsr from './lib/lsr';
import { setup, clean } from './lib/output';

const listTemplate = async dir => await lsr(resolve(__dirname, '../examples', dir), ['.gitkeep', 'package.json']);
const listOutput = async dir => await lsr(dir, ['.gitkeep', 'package.json']);

test('preact create - before', async () => {
	await setup();
});

test('preact create - should create project using full template by default.', async t => {
	let fullExample = await listTemplate('full');
	let app = await create('app');
	let generated = await listOutput(app);

	t.isEquivalent(generated, fullExample);
});

['root', 'simple', 'empty'].forEach(template =>
	test(`preact create - should create project using provided template. Verifying ${template}`, async t => {
		let example = await listTemplate(template);
		let app = await create('app', template);
		let generated = await listOutput(app);

		t.isEquivalent(generated, example);
	})
);

test('preact build - after', async () => {
	await clean();
});
