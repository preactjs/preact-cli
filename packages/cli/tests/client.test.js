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

	//it('should hydrate routes progressively with preact8.', async () => {
	//	let dir = await subject('progressive-hydration-preact8');
	//	await build(dir, {}, true);
	//	const server = getServer(join(dir, 'build'), PORT);

	//	// let page = await loadPage(chrome, `http://127.0.0.1:${PORT}/`);
	//	const page = await chrome.newPage();

	//	page.on('console', consoleMessage => {
	//		// eslint-disable-next-line
	//		console[consoleMessage.type()](consoleMessage.text());
	//	});

	//	await page.goto(`http://127.0.0.1:${PORT}/`);

	//	// await waitUntilExpression(page, `window.booted`);
	//	await sleep(500);

	//	const mutations = await page.evaluate('window.ROOT_MUTATION_COUNT');

	//	expect(mutations).toEqual(0);

	//	expect(await page.evaluate('window.CHANGED_VAR')).toEqual(undefined);
	//	await page.click('button');
	//	expect(await page.evaluate('window.CHANGED_VAR')).toEqual(1);

	//	server.server.close();
	//});

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
