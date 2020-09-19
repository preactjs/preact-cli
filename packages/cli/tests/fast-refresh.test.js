const fs = require('../lib/fs');
const { join } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');
const getPort = require('get-port');

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

	async function updateFile(base, file, replacer) {
		const compPath = join(base, file);
		const content = await fs.readFile(compPath, 'utf-8');
		await fs.writeFile(compPath, replacer(content));
	}

	const getText = async el => el ? el.evaluate(el => el.textContent) : null;

	it('should create development server with fast-refresh.', async () => {
		let app = await create('default');
		const port = await getPort()
		server = await watch(app, port, '127.0.0.1', true);

		let page = await loadPage(chrome, `http://127.0.0.1:${port}/profile`);
		const titles = await page.$$('h1');
		expect(await getText(titles[0])).toEqual('Preact App');

		await updateFile(app, './src/components/header/index.js', (content) => content.replace('<h1>Preact App</h1>', '<h1 className="test">Test App</h1>'));
		await expectByPolling(async () => getText(await page.$('.test')), 'Test App');

		const [button] = await page.$$('button');
		const [,count] = await page.$$('p');
		await button.click();
		await expectByPolling(() => getText(count), '11');

		await updateFile(app, './src/routes/profile/index.js', (content) => content.replace('setCount((count) => count + 1)', 'setCount((count) => count + 2)'));
		await wait(2000);

		await button.click();
		await expectByPolling(() => getText(count), '13');

		await updateFile(app, './src/routes/profile/index.js', (content) => content.replace('useState(10)', 'useState(20)'));
		await wait(2000);

		await expectByPolling(() => getText(count), '20');
		server.close();
	});
});
