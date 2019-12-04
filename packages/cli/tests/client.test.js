const { join } = require('path');
const startChrome = require('./lib/chrome');
const { subject } = require('./lib/output');
const { sleep } = require('./lib/utils');
const { build } = require('./lib/cli');
const { getServer } = require('./server');

let chrome;

const PORT = 8084;

describe('client-side tests', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	it('should hydrate routes progressively.', async () => {
		let dir = await subject('progressive-hydration');
		await build(dir);
		const server = getServer(join(dir, 'build'), PORT);

		// let page = await loadPage(chrome, `http://127.0.0.1:${PORT}/`);
		const page = await chrome.newPage();

		page.on('console', consoleMessage => {
			console[consoleMessage.type()](consoleMessage.text());
		});

		await page.goto(`http://127.0.0.1:${PORT}/`);

		// await waitUntilExpression(page, `window.booted`);
		await sleep(500);

		const mutations = await page.evaluate('window.mutations');

		expect(mutations).toHaveLength(0);

		// await page.evaluate(`document.querySelector('a[href="/"]').click()`);
		// await sleep(500);

		server.server.close();
	});
});
