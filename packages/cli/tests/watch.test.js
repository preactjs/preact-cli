const { readFile, writeFile } = require('fs').promises;
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');
const { determinePort } = require('../lib/commands/watch');
const { subject } = require('./lib/output');
const { getServer } = require('./server');

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

	it('should use a custom `.env` with prefixed environment variables', async () => {
		let app = await create('default');

		let header = resolve(app, './src/components/header/index.js');
		let original = await readFile(header, 'utf8');
		let update = original.replace(
			'<h1>Preact App</h1>',
			'<h1>{process.env.PREACT_APP_MY_VARIABLE}</h1>'
		);
		await writeFile(header, update);
		await writeFile(
			resolve(app, '.env'),
			'PREACT_APP_MY_VARIABLE="Hello World!"'
		);

		server = await watch(app, 8085);

		let page = await loadPage(chrome, 'http://127.0.0.1:8085/');

		// "Hello World!" should replace 'process.env.PREACT_APP_MY_VARIABLE'
		await waitUntilExpression(
			page,
			`document.querySelector('header > h1').innerText === 'Hello World!'`
		);

		server.close();
	});

	it('should proxy requests when "proxy" exists in package.json', async () => {
		const api = getServer('', 8086);
		let app = await subject('proxy');

		server = await watch(app, 8087);

		let page = await loadPage(chrome, 'http://127.0.0.1:8087/');

		await waitUntilExpression(
			page,
			`document.querySelector('h1').innerText === 'Data retrieved from proxied server: Hello World!'`
		);

		server.close();
		api.server.close();
	});
});

describe('should determine the correct port', () => {
	it('should prefer --port over $PORT', async () => {
		process.env.PORT = '4000';
		expect(await determinePort('3999')).toBe(3999);
	});

	it('should use $PORT in the absence of --port', async () => {
		process.env.PORT = '4001';
		expect(await determinePort()).toBe(4001);
	});

	it('should use $PORT if --port is invalid', async () => {
		process.env.PORT = '4002';
		expect(await determinePort('invalid-port')).toBe(4002);
	});

	it('should use 8080 if $PORT and --port are invalid', async () => {
		process.env.PORT = 'invalid-port-too';
		expect(await determinePort('invalid-port')).toBe(8080);
	});

	it('should return an error if requested --port is taken', async () => {
		expect(
			Promise.all([determinePort(4003), determinePort(4003)])
		).rejects.toThrow(
			'Another process is already running on port 4003. Please choose a different port.'
		);
	});

	it('should fallback to random if $PORT or 8080 are taken and --port is not specified', async () => {
		process.env.PORT = '4004';
		await Promise.all([determinePort(), determinePort()]).then(values => {
			expect(values[0]).toBe(4004);
			expect(values[1]).toBeGreaterThanOrEqual(1024);
			expect(values[1]).toBeLessThanOrEqual(65535);
		});

		// This is pretty awful, but would be the way to do it. get-port locks the port for ~30 seconds,
		// so if we want to test any behavior with our default (8080) twice, we'd have to wait :/
		//
		//await sleep(35000);

		//process.env.PORT = undefined;
		//await Promise.all([determinePort(), determinePort()]).then(values => {
		//	console.log(values);
		//	expect(values[0]).toBe(8080);
		//	expect(values[1]).toBeGreaterThanOrEqual(1024);
		//	expect(values[1]).toBeLessThanOrEqual(65535);
		//});
	});
});
