const { join } = require('path');
const { create, build } = require('./lib/cli');
const { promisify } = require('util');
const { getServer } = require('./server');
const puppeteer = require('puppeteer');

const sleep = promisify(setTimeout);

describe('preact build', () => {
	let server, browser;

	beforeAll(async () => {
		let dir = await create('default');
		browser = await puppeteer.launch();
		await build(dir, {
			sw: true,
			esm: true,
		});
		dir = join(dir, 'build');
		server = getServer(dir);
	});

	afterAll(async () => {
		server.server.stop();
		await browser.close();
	});

	it(`builds the default output`, async () => {
		const page = await browser.newPage();
		await page.goto('http://localhost:3000', {
			waitUntil: 'load',
		});
		const initialContent = await page.content();
		await sleep(2000); // wait for service worker installation.
		await page.setOfflineMode(true);
		await page.reload({
			waitUntil: 'load',
		});
		const offlineContent = await page.content();
		await page.screenshot({ path: 'screenshot.png' });
		await page.waitForSelector('h1');
		expect(
			await page.$$eval('h1', nodes => nodes.map(n => n.innerText))
		).toEqual(['Preact App', 'Home']);
		expect(initialContent).toEqual(offlineContent);
	});
});
