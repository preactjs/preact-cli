const fs = require('../lib/fs');
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');
const { sleep } = require('./lib/utils');

const { loadPage, waitUntilExpression } = startChrome;
let chrome, server;

describe('preact', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	it('should create development server with hot reloading.', async () => {
		let app = await create('default');
		server = await watch(app, 8083);

		let page = await loadPage(chrome, 'http://127.0.0.1:8083/');

		let header = resolve(app, './src/components/header/index.js');
		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await fs.writeFile(header, update);

		await waitUntilExpression(
			page,
			`document.querySelector('header > h1').innerText === 'Test App'`
		);

		server.close();
	});

	it('should hot reload and prerender without a development server', async () => {
		let dir = await create('default');
		await watch(dir, undefined, undefined, false);

		const initialContent = await fs.readFile(
			resolve(dir, './build/bundle.js'),
			'utf8'
		);

		let header = resolve(dir, './src/components/header/index.js');
		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await fs.writeFile(header, update);

		await sleep(1500); // wait for a rebuild
		const updatedContent = await fs.readFile(
			resolve(dir, './build/bundle.js'),
			'utf8'
		);

		expect(updatedContent).not.toEqual(initialContent);
		expect(updatedContent).not.toContain('Preact App');
	});
});
