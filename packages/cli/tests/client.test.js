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

		const page = await chrome.newPage();

		page.on('console', (consoleMessage) => {
			// eslint-disable-next-line
			console[consoleMessage.type()](consoleMessage.text());
		});

		await page.goto(`http://127.0.0.1:${PORT}/`);

		await sleep(500);

		const mutations = await page.evaluate('window.mutations');

		expect(mutations).toHaveLength(0);

		server.server.close();
	});
});
