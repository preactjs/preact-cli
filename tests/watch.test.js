const fs = require('fs.promised');
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');

const { loadPage, waitUntilExpression } = startChrome;
let chrome, launcher, server;

describe('preact', () => {
	beforeAll(async () => {
		let result = await startChrome();
		launcher = result.launcher;
		chrome = result.protocol;
	});

	afterAll(async () => {
		await chrome.close();
		await launcher.kill();
	});

	it('should create development server with hot reloading.', async () => {
		let { Runtime } = chrome;
		let app = await create('default');
		server = await watch(app, 8083);

		await loadPage(chrome, 'http://127.0.0.1:8083/');

		let header = resolve(app, './src/components/header/index.js');
		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await fs.writeFile(header, update);

		await waitUntilExpression(
			Runtime,
			`document.querySelector('header > h1').innerText === 'Test App'`,
		);

		server.close();
	});
});
