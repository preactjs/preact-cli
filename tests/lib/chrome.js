import { Launcher } from 'lighthouse/chrome-launcher';
import chrome from 'chrome-remote-interface';

export default async () => {
	let launcher = new Launcher({
		port: 9222,
		autoSelectChrome: true,
		additionalFlags: [
			'--window-size=1024,768',
			'--disable-gpu',
			'--headless'
		]
	});
	launcher.pollInterval = 1000;
	await launcher.launch();
	let protocol = await setup();
	return { launcher, protocol };
};

export const waitUntil = async (Runtime, expression, retryCount = 10, retryInterval = 500) => {
	if (retryCount < 0) {
		throw new Error(`Wait until: '${expression}' timed out.`);
	}

	let { result } = await Runtime.evaluate({ expression });

	if (!result || !result.value) {
		await delay(retryInterval);
		await waitUntil(Runtime, expression, retryCount - 1, retryInterval);
	}
};

export const loadPage = async (chrome, url, retryCount = 40, retryInterval = 500) => {
	let result = await openPage(chrome, url, retryCount, retryInterval);
	await chrome.Page.loadEventFired();
	return result;
};

const openPage = async (chrome, url, retryCount, retryInterval) => {
	if (retryCount < 0) {
		throw new Error('Page could not be loaded!');
	}

	let { Network, Page } = chrome;
	Page.navigate({ url });

	let result;

	try {
		result = await new Promise((resolve, reject) => {
			Network.responseReceived((result) => {
				let { status, url: responseUrl } = result.response;
				if (responseUrl === url && status === 200) {
					resolve(result);
				}
			});

			setTimeout(() => {
				reject();
			}, retryInterval);
		});
	} catch (e) {
		result = await openPage(chrome, url, retryCount - 1, retryInterval);
	}

	return result;
};

const delay = time => new Promise(r => setTimeout(() => r(), time));

const setup = () => new Promise((resolve, reject) => {
	chrome(protocol => {
		const { Page, Runtime, Network } = protocol;

		Promise.all([
			Page.enable(),
			Runtime.enable(),
			Network.enable(),
		]).then(() => {
			resolve(protocol);
		})
		.catch(reject);
		}).on('error', err =>  reject(new Error('Cannot connect to Chrome:' + err)));
});
