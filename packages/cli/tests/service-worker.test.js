const { join } = require('path');
const { create, build } = require('./lib/cli');
const { readFile, writeFile } = require('../lib/fs');
const { sleep } = require('./lib/utils');
const { getServer } = require('./server');
const startChrome = require('./lib/chrome');

describe('preact service worker tests', () => {
	let server, browser, dir;

	beforeAll(async () => {
		dir = await create('default');
		browser = await startChrome();
		await build(dir, {
			sw: true,
			esm: true,
		});
		dir = join(dir, 'build');
		server = getServer(dir);
	});

	afterAll(async () => {
		await server.server.stop();
		await browser.close();
	});

	it('works offline', async () => {
		const page = await browser.newPage();
		await page.setCacheEnabled(false);
		await page.goto('http://localhost:3000', {
			waitUntil: 'networkidle0',
		});
		const initialContent = await page.content();
		await sleep(2000); // wait for service worker installation.
		await page.setOfflineMode(true);
		await page.reload();
		const offlineContent = await page.content();
		await page.waitForSelector('h1');
		expect(
			await page.$$eval('h1', nodes => nodes.map(n => n.innerText))
		).toEqual(['Preact App', 'Home']);
		expect(offlineContent).toEqual(initialContent);
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
});
