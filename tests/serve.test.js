import { resolve } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import uuid from 'uuid/v4';
import { By, until } from 'selenium-webdriver';
import run, { spawn } from './run';
import createDriver, { waitForServerStart } from './selenium';
import fs from 'fs.promised';

const rm = promisify(rimraf);

describe('preact serve', () => {
	let workDir = '';
	let serve;
	let driver;
	let appDir;

	beforeAll(async () => {
		workDir = resolve(__dirname, 'output', uuid());
		await mkdirp(workDir);
		driver = await createDriver();
		await run(['create', 'app', '--no-install'], workDir);
		appDir = resolve(workDir, 'app');
		await run(['build'], appDir);
	});

	afterEach(() => {
		if (serve) {
			serve.kill();
		}
	});

	afterAll(async () => {
		await rm(workDir);
		await driver.quit();
	});

	it(`should create server hosting the app.`, async () => {
		serve = spawn(['serve'], appDir);
		let url = 'https://localhost:8080/';

		// Wait for server to start
		await waitForServerStart(driver, url);
		await driver.get(url);

		let html = await driver.findElement(By.css('body'))
			.getAttribute('outerHTML');

		expect(html).toMatchSnapshot();
	});
});
