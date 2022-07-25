const { join } = require('path');
const startChrome = require('./lib/chrome');
const { subject } = require('./lib/output');
const { sleep } = require('./lib/utils');
const { build } = require('./lib/cli');
const { getServer } = require('./server');
const getPort = require('get-port');

let chrome;
let PORT;

describe('client-side tests', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	beforeEach(async () => {
		PORT = await getPort();
	});

	it('should hydrate for pre-rendered URLs only', async () => {
		let dir = await subject('prerendering-hydration');
		await build(dir, {});
		const server = getServer(join(dir, 'build'), PORT, true);
		const page = await chrome.newPage();
		await page.goto(`http://127.0.0.1:${PORT}/`);
		await sleep(500);
		expect(
			await page.evaluate(
				'document.querySelector("div").getAttribute("rendered-on")'
			)
		).toEqual('server');
		await page.goto(`http://127.0.0.1:${PORT}/foo`);
		expect(
			await page.evaluate(
				'document.querySelector("div").getAttribute("rendered-on")'
			)
		).toEqual('client');
		server.server.close();
	});
});
