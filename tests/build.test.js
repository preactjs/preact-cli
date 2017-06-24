import test from './async-test';
import { resolve } from 'path';
import { create, build } from './lib/cli';
import lsr from './lib/lsr';
import { setup, clean } from './lib/output';
import { normalize, expectedOutputs } from './build.snapshot';

const options = { timeout: 150 * 1000 };

test('preact build - before', async () => {
	await setup();
});

['empty', 'simple', 'root', 'default'].forEach(template =>
	test(`preact build - should produce output. Veryfing ${template}`, options, async t => {
		let app = await create('app', template);
		await build(app);

		let output = await lsr(resolve(app, 'build'));

		t.isEquivalent(normalize(output), expectedOutputs[template]);
	})
);

test('preact build - after', async () => {
	await clean();
});
