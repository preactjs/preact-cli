import { resolve } from 'path';
import fs from 'fs.promised';
import { create, build, watch } from './lib/cli';
import startChrome, { loadPage, waitUntil } from './lib/chrome';
import { setup } from './lib/output';

let chrome, launcher, server;

describe('preact', () => {
	beforeAll(async () => {
		await setup();
		let result = await startChrome();
		chrome = result.protocol;
		launcher = result.launcher;
	});

	afterAll(async () => {
		await chrome.close();
		await launcher.kill();
	});

	it('should create development server with hot reloading.', async () => {
		let { Runtime } = chrome;
		let app = await create('app');
		await build(app);
		server = await watch(app, 8083);
		let headerComponentSourceFile = resolve(app, './src/components/header/index.js');

		await loadPage(chrome, 'http://localhost:8083/');
		let headerComponentSourceCode = await fs.readFile(headerComponentSourceFile, 'utf8');
		let newSourceCode = headerComponentSourceCode.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
		await fs.writeFile(headerComponentSourceFile, newSourceCode);

		await waitUntil(
			Runtime,
			`document.querySelector('header > h1').innerText === 'Test App'`,
		);
	});

	afterEach(async () => {
		await server.kill();
	});
});
