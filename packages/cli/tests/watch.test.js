const { readFile, writeFile } = require('fs').promises;
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');

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
		let original = await readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await writeFile(header, update);

		await waitUntilExpression(
			page,
			`document.querySelector('header > h1').innerText === 'Test App'`
		);

		server.close();
	});
});
