import test from './async-test';
import { resolve } from 'path';
import { create, build } from './lib/cli';
import lsr from './lib/lsr';
import { setup, clean } from './lib/output';
import expectedOutputs from './build.snapshot';
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

test('preact build - after', async () => {
	await clean();
});
