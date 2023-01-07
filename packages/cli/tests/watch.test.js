const { mkdir, readFile, rename, writeFile } = require('fs/promises');
const { join, resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');
const { determinePort } = require('../src/commands/watch');
const { subject } = require('./lib/output');
const { getServer } = require('./server');
const shell = require('shelljs');
const fetch = require('isomorphic-unfetch');

const { loadPage, waitUntilExpression } = startChrome;
let chrome, server;

describe('preact watch', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	it('should create development server with hot reloading.', async () => {
		let app = await create('default');
		server = await watch(app, { port: 8083 });

		let page = await loadPage(chrome, 'http://127.0.0.1:8083/');

		let header = resolve(app, './src/components/header/index.js');
		let original = await readFile(header, 'utf8');
		let update = original.replace('<h1>Preact CLI</h1>', '<h1>Test App</h1>');
		await writeFile(header, update);

		await waitUntilExpression(
			page,
			`document.querySelector('header h1').innerText === 'Test App'`
		);

		await server.stop();
	});

	it('should use a custom `.env` with prefixed environment variables', async () => {
		let app = await create('default');

		let header = resolve(app, './src/components/header/index.js');
		let original = await readFile(header, 'utf8');
		let update = original.replace(
			'<h1>Preact CLI</h1>',
			'<h1>{process.env.PREACT_APP_MY_VARIABLE}</h1>'
		);
		await writeFile(header, update);
		await writeFile(
			resolve(app, '.env'),
			'PREACT_APP_MY_VARIABLE="Hello World!"'
		);

		server = await watch(app, { port: 8085 });

		let page = await loadPage(chrome, 'http://127.0.0.1:8085/');

		// "Hello World!" should replace 'process.env.PREACT_APP_MY_VARIABLE'
		await waitUntilExpression(
			page,
			`document.querySelector('header h1').innerText === 'Hello World!'`
		);

		await server.stop();
	});

	it('should proxy requests when "proxy" exists in package.json', async () => {
		const api = getServer('', 8086);
		let app = await subject('proxy');

		server = await watch(app, { port: 8087 });

		let page = await loadPage(chrome, 'http://127.0.0.1:8087/');

		await waitUntilExpression(
			page,
			`document.querySelector('h1').innerText === 'Data retrieved from proxied server: Hello World!'`
		);

		await server.stop();
		api.server.close();
	});

	describe('CLI Options', () => {
		it('--src', async () => {
			let app = await subject('minimal');

			await mkdir(join(app, 'renamed-src'));
			await rename(join(app, 'index.js'), join(app, 'renamed-src/index.js'));
			await rename(join(app, 'style.css'), join(app, 'renamed-src/style.css'));

			server = await watch(app, { port: 8088, src: 'renamed-src' });

			let page = await loadPage(chrome, 'http://127.0.0.1:8088/');

			await waitUntilExpression(
				page,
				`document.querySelector('h1').innerText === 'Minimal App'`
			);

			await server.stop();
		});

		it('--sw', async () => {
			let app = await subject('minimal');

			// The `waitUntil` in these tests ensures the SW is installed before our checks
			server = await watch(app, { port: 8090 });
			let page = await chrome.newPage();
			await page.goto('http://127.0.0.1:8090/', { waitUntil: 'networkidle0' });
			expect(
				await page.evaluate(async () => {
					return await navigator.serviceWorker
						.getRegistrations()
						.then(registrations =>
							registrations[0].active.scriptURL.endsWith('/sw-debug.js')
						);
				})
			).toBe(true);
			await server.stop();

			server = await watch(app, { port: 8091, sw: true });
			page = await chrome.newPage();
			await page.goto('http://127.0.0.1:8091/', { waitUntil: 'networkidle0' });
			expect(
				await page.evaluate(async () => {
					return await navigator.serviceWorker
						.getRegistrations()
						.then(registrations =>
							registrations[0].active.scriptURL.endsWith('/sw.js')
						);
				})
			).toBe(true);
			await server.stop();

			server = await watch(app, { port: 8092, sw: false });
			page = await chrome.newPage();
			await page.goto('http://127.0.0.1:8092/', { waitUntil: 'networkidle0' });
			expect(
				await page.evaluate(async () => {
					return await navigator.serviceWorker
						.getRegistrations()
						.then(registrations => registrations);
				})
			).toHaveLength(0);
			await server.stop();
		});

		it('--babelConfig', async () => {
			let app = await subject('custom-babelrc');

			server = await watch(app, { port: 8093 });
			let bundle = await fetch('http://127.0.0.1:8093/bundle.js').then(res =>
				res.text()
			);
			expect(/=>\s?setTimeout/.test(bundle)).toBe(true);
			await server.stop();

			await rename(join(app, '.babelrc'), join(app, 'babel.config.json'));
			server = await watch(app, {
				port: 8094,
				babelConfig: 'babel.config.json',
			});
			bundle = await fetch('http://127.0.0.1:8094/bundle.js').then(res =>
				res.text()
			);
			expect(/=>\s?setTimeout/.test(bundle)).toBe(true);

			await server.stop();
		});

		it('--template', async () => {
			let app = await subject('custom-template');

			await rename(
				join(app, 'template.ejs'),
				join(app, 'renamed-template.ejs')
			);

			server = await watch(app, {
				port: 8095,
				template: 'renamed-template.ejs',
			});
			const html = await fetch('http://127.0.0.1:8095/').then(res =>
				res.text()
			);
			expect(html).toMatch('<meta name="example-meta" content="Hello Dev">');
			await server.stop();
		});

		it('--config', async () => {
			let app = await subject('custom-webpack');

			server = await watch(app, { port: 8096, config: 'preact.config.js' });
			let bundle = await fetch('http://127.0.0.1:8096/renamed-bundle.js').then(
				res => res.text()
			);
			expect(bundle).toMatch('This is an app with custom webpack config');
			await server.stop();

			await rename(
				join(app, 'preact.config.js'),
				join(app, 'renamed-config.js')
			);
			server = await watch(app, { port: 8097, config: 'renamed-config.js' });
			bundle = await fetch('http://127.0.0.1:8097/renamed-bundle.js').then(
				res => res.text()
			);
			expect(bundle).toMatch('This is an app with custom webpack config');
			await server.stop();
		});

		it('--invalid-arg', async () => {
			const { code, stderr } = shell.exec(
				`node ${join(__dirname, '../src/index.js')} watch --invalid-arg`
			);
			expect(stderr).toMatch(
				"Invalid argument '--invalid-arg' passed to watch."
			);
			expect(code).toBe(1);
		});
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
		const ports = await Promise.all([determinePort(), determinePort()]);
		expect(ports[0]).toBe(4004);
		expect(ports[1]).not.toBe(4004);
		expect(ports[1]).toBeGreaterThanOrEqual(1024);
		expect(ports[1]).toBeLessThanOrEqual(65535);
	});
});
