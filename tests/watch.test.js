const fs = require('fs.promised');
const { resolve } = require('path');
const { create, build, watch } = require('./lib/cli');
const startChrome = require('./lib/chrome');

const { loadPage, waitUntilExpression } = startChrome;
let chrome, launcher, server;

describe('preact', () => {
	beforeAll(async () => {
		let result = await startChrome();
		console.log('> CHROME STARTED');
		chrome = result.protocol;
		launcher = result.launcher;
	});

	afterAll(async () => {
		await chrome.close();
		await launcher.kill();
	});

	it('should create development server with hot reloading.', async () => {
		let { Runtime } = chrome;
		let app = await create('default');
		await build(app);
		server = await watch(app, '127.0.0.1', 8083);
		let headerComponentSourceFile = resolve(app, './src/components/header/index.js');

		await loadPage(chrome, 'http://localhost:8083/');
		let headerComponentSourceCode = await fs.readFile(headerComponentSourceFile, 'utf8');
		let newSourceCode = headerComponentSourceCode.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await fs.writeFile(headerComponentSourceFile, newSourceCode);

		await waitUntilExpression(
			Runtime,
			`document.querySelector('header > h1').innerText === 'Test App'`,
		);
	});

	afterEach(async () => {
		await server.kill();
	});
});
