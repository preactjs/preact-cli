const fs = require('../lib/fs');
const { resolve } = require('path');
const startChrome = require('./lib/chrome');
const { create, watch } = require('./lib/cli');

const { loadPage, waitUntilExpression } = startChrome;
let chrome, server;

const wait = (timeout) => new Promise((res) => setTimeout(res, timeout));

describe('preact', () => {
	beforeAll(async () => {
		chrome = await startChrome();
	});

	afterAll(async () => {
		await chrome.close();
	});

	jest.setTimeout(100000);

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

	const getText = async el => el ? el.evaluate(el => el.textContent) : null;

	it('should create development server with fast-refresh.', async () => {
		let app = await create('default');
		server = await watch(app, 8084, '127.0.0.1', true);

		let page = await loadPage(chrome, 'http://127.0.0.1:8084/');
		const title = await page.$('.test');
		expect(await getText(title)).toEqual('Preact App');

		let header = resolve(app, './src/components/header/index.js');
		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('<h1>Preact App</h1>', '<h1 className="test">Test App</h1>');
		await fs.writeFile(header, update);
		await wait(2000);

		expect(await getText(title)).toEqual('Test App');

		server.close();
	});

	it('should keep state around with fast-refresh', async () => {
		let app = await create('default');
		server = await watch(app, 8085, '127.0.0.1', true);

		let page = await loadPage(chrome, 'http://127.0.0.1:8085/');
		const title = await page.$('.test');
		expect(await getText(title)).toEqual('Preact App');
		let header = resolve(app, './src/components/header/index.js');
		const newHeader = `
			import { h } from 'preact';
			import { useState } from 'preact/hooks';
			import { Link } from 'preact-router/match';
			import style from './style.css';

			const Header = () => {
				const [count, setCount] = useState(0);
				return (
					<header class={style.header}>
						<h1>Preact App</h1>
						<nav>
							<Link activeClassName={style.active} href="/">Home</Link>
							<Link activeClassName={style.active} href="/profile">Me</Link>
							<Link activeClassName={style.active} href="/profile/john">John</Link>
						</nav>
						<button className="increment" onClick={() => setCount(count + 1)}>Increment</button>
						<p className="count">{count}</p>
					</header>
				)
			}

			export default Header;
		`;
		await fs.writeFile(header, newHeader);

		await wait(2000);

		const button = await page.$('.increment');
		const count = await page.$('.count');
		expect(await getText(count)).toEqual('0');
		await button.click();
		expect(await getText(count)).toEqual('1');

		let original = await fs.readFile(header, 'utf8');
		let update = original.replace('setCount(count + 1)', 'setCount(count + 2)');
		await fs.writeFile(header, update);
		await wait(2000);

		await button.click();
		expect(await getText(count)).toEqual('3');

		update = original.replace('useState(0)', 'useState(20)');
		await fs.writeFile(header, update);
		await wait(2000);

		expect(await getText(count)).toEqual('20');

		server.close();
	});
});
