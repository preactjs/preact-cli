const fs = require('../lib/fs');
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');

const { loadPage } = startChrome;
let chrome, server;

const wait = (t) => new Promise(res => setTimeout(res, t));

const expectByPolling = async (poll, expected) => {
	const maxTries = 20;
	for (let tries = 0; tries < maxTries; tries++) {
		const actual = (await poll()) || '';
		if (actual.indexOf(expected) > -1 || tries === maxTries - 1) {
			expect(actual).toMatch(expected);
			break;
		} else {
			await wait(50);
		}
	}
};

describe('preact', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	jest.setTimeout(100000);

	const getText = async el => el ? el.evaluate(el => el.textContent) : null;

	it('should create development server with fast-refresh.', async () => {
		let app = await create('default');
		server = await watch(app, 8084, '127.0.0.1', true);

		let page = await loadPage(chrome, 'http://127.0.0.1:8084/');
		const titles = await page.$$('h1');
		expect(await getText(titles[0])).toEqual('Preact App');

		let home = resolve(app, './src/routes/home/index.js');
		let header = resolve(app, './src/components/header/index.js');
		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1 className="test">Test App</h1>');
		await fs.writeFile(header, update);

		await expectByPolling(async () => getText(await page.$('.test')), 'Test App');

		let counter = resolve(app, './src/components/counter.js');
		const newCounter = `
			import { h } from 'preact';
			import { useState } from 'preact/hooks';

			const Counter = () => {
				const [count, setCount] = useState(0);
				return (
					<div class={style.header}>
						<button className="increment" onClick={() => setCount(count + 1)}>Increment</button>
						<p className="count">{count}</p>
					</div>
				)
			}

			export default Counter;
		`;
		await fs.writeFile(counter, newCounter);
		original = await fs.readFile(home, 'utf8');
		update = original.replace('<h1>Home</h1>', '<Counter />');
		update = 'import Counter from "../../components/Counter";\n' + update;
		await fs.writeFile(home, update);
		await wait(2000);

		const button = await page.$('.increment');
		const count = await page.$('.count');
		await button.click();
		await expectByPolling(() => getText(count), '1');

		original = await fs.readFile(counter, 'utf8');
		update = original.replace('setCount(count + 1)', 'setCount(count + 2)');
		await fs.writeFile(counter, update);
		await wait(2000);

		await button.click();
		expect(await getText(count)).toEqual('3');

		update = update.replace('useState(0)', 'useState(20)');
		await fs.writeFile(counter, update);
		await wait(2000);

		expect(await getText(count)).toEqual('20');

		server.close();
	});
});
