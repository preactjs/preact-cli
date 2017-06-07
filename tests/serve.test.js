import { resolve } from 'path';
import mkdirp from 'mkdirp';
import rimraf from 'rimraf';
import promisify from 'es6-promisify';
import uuid from 'uuid/v4';
import { By } from 'selenium-webdriver';
import run, { spawn } from './run';
import createDriver from './selenium/driver';

const rm = promisify(rimraf);

describe('preact serve', () => {
	let workDir = '';
	let serve;
	let driver;

	beforeEach(async () => {
		workDir = resolve(__dirname, 'output', uuid());
		await mkdirp(workDir);
		driver = await createDriver();
	});

	afterEach(async () => {
		if (serve) {
			serve.kill();
		}

		await rm(workDir);
		await driver.quit();
	});

	it(`should create server hosting the app.`, async () => {
		await run(['create', 'app', '--no-install'], workDir);
		let appDir = resolve(workDir, 'app');
		await run(['build'], appDir);
		serve = spawn(['serve'], appDir);

		// Wait for server to start
		await driver.sleep(500);
		await driver.get('https://localhost:8080/');

		let html = await driver.findElement(By.css('body'))
			.getAttribute('outerHTML');

		expect(html).toMatchSnapshot();
	});
});
