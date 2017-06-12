import test from './async-test';
import { resolve } from 'path';
import fs from 'fs.promised';
import { create, build, watch } from './lib/cli';
import startChrome, { loadPage, waitUntil } from './lib/chrome';
import { setup, clean } from './lib/output';

const options = { timeout: 120 * 1000 };
let chrome, launcher;

test('preact watch - before', options, async () => {
	await setup();
	let result = await startChrome();
	chrome = result.protocol;
	launcher = result.launcher;
});

test(`preact watch - should create development server with hot reloading.`, options, async t => {
	let { Runtime } = chrome;
	let app = await create('app');
	await build(app);
	let server = await watch(app, 8083);
	let headerComponentSourceFile = resolve(app, './src/components/header/index.js');

	await loadPage(chrome, 'http://localhost:8083/');
	let headerComponentSourceCode = await fs.readFile(headerComponentSourceFile, 'utf8');
	let newSourceCode = headerComponentSourceCode.replace('<h1>Preact App</h1>', '<h1>Test App</h1>');
	await fs.writeFile(headerComponentSourceFile, newSourceCode);

	await waitUntil(
		Runtime,
		`document.querySelector('header > h1').innerText === 'Test App'`,
	);

	await server.kill();
	t.pass();
});

test(`preact watch - after`, options, async () => {
	await clean();
	await chrome.close();
	await launcher.kill();
});
