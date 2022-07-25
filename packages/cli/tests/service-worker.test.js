const { join } = require('path');
const { readFile, writeFile } = require('fs').promises;
const { create, build } = require('./lib/cli');
const { sleep } = require('./lib/utils');
const { getServer } = require('./server');
const startChrome = require('./lib/chrome');
const fetch = require('isomorphic-unfetch');

async function enableOfflineMode(page, browser) {
	await sleep(2000); // wait for service worker installation.
	await page.setOfflineMode(true);
	const targets = await browser.targets();
	const serviceWorker = targets.find(t => t.type() === 'service_worker');
	const serviceWorkerConnection = await serviceWorker.createCDPSession();
	await serviceWorkerConnection.send('Network.enable');
	await serviceWorkerConnection.send('Network.emulateNetworkConditions', {
		offline: true,
		latency: 0,
		downloadThroughput: 0,
		uploadThroughput: 0,
	});
}

describe('preact service worker tests', () => {
	let server, browser, dir;

	beforeAll(async () => {
		dir = await create('default');
		await build(dir, { sw: true });
		dir = join(dir, 'build');
		server = getServer(dir);
	});

	beforeEach(async () => {
		browser = await startChrome();
	});

	afterEach(async () => {
		await browser.close();
	});

	afterAll(() => {
		server.server.close();
	});

	it('works offline', async () => {
		const page = await browser.newPage();
		await page.setCacheEnabled(false);
		await page.goto('http://localhost:3000', {
			waitUntil: 'networkidle0',
		});
		const initialContent = await page.content();
		await enableOfflineMode(page, browser);
		await page.reload({ waitUntil: 'networkidle0' });
		const offlineContent = await page.content();
		await page.waitForSelector('h1');
		expect(
			await page.$$eval('h1', nodes => nodes.map(n => n.innerText))
		).toEqual(['Preact App', 'Home']);
		expect(offlineContent).not.toEqual(initialContent);
	});

	it('should fetch navigation requests with networkFirst', async () => {
		const page = await browser.newPage();
		await page.setCacheEnabled(false);
		await page.goto('http://localhost:3000', {
			waitUntil: 'networkidle0',
		});
		const initialContent = await page.content();
		await sleep(2000); // wait for service worker installation.
		const indexHtmlPath = join(dir, 'index.html');
		let indexHtml = await readFile(indexHtmlPath, {
			encoding: 'utf-8',
		});
		const NEW_TITLE = '<title>Refreshed test-default</title>';
		indexHtml = indexHtml.replace('<title>test-default</title>', NEW_TITLE);
		await writeFile(indexHtmlPath, indexHtml);
		await page.reload({
			waitUntil: 'networkidle0',
		});
		const refreshedContent = await page.content();
		expect(initialContent).not.toEqual(refreshedContent);
		expect(refreshedContent.includes(NEW_TITLE)).toEqual(true);
	});

	it('should respond with 200.html when offline', async () => {
		const swText = await fetch('http://localhost:3000/sw.js').then(res =>
			res.text()
		);
		// eslint-disable-next-line no-useless-escape
		expect(swText).toMatch(
			/caches.match\(\w+\("\/200.html"\)\|\|\w+\("\/index.html"\)/
		);
		const page = await browser.newPage();
		await page.setCacheEnabled(false);
		await page.goto('http://localhost:3000', {
			waitUntil: 'networkidle0',
		});
		await enableOfflineMode(page, browser);
		await page.reload({ waitUntil: 'networkidle0' });
		expect(
			await page.$$eval('script[type=__PREACT_CLI_DATA__]', nodes =>
				nodes.map(n => n.innerText)
			)
		).toEqual(['%7B%22preRenderData%22:%7B%22url%22:%22/200.html%22%7D%7D']);
	});
});
