import { resolve } from 'path';
import { create } from './lib/cli';
import lsr from './lib/lsr';
import { setup } from './lib/output';

const listTemplate = async dir => await lsr(resolve(__dirname, '../examples', dir), ['.gitkeep', 'package.json']);
const listOutput = async dir => await lsr(dir, ['.gitkeep', 'package.json', 'package-lock.json', 'node_modules']);


describe('preact create', () => {
	beforeAll(async () => {
		await setup();
	});

	it('preact create - should create project using full template by default.', async () => {
		let fullExample = await listTemplate('full');
		let app = await create('app');
		let generated = await listOutput(app);

		expect(generated).toEqual(fullExample);
	});

	['root', 'simple', 'empty'].forEach(template =>
		it(`preact create - should create project using provided template. Verifying ${template}`, async () => {
			let example = await listTemplate(template);
			let app = await create('app', template);
			let generated = await listOutput(app);

			expect(generated).toEqual(example);
		})
	);
});
