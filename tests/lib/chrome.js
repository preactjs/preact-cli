import { Launcher } from 'chrome-launcher';
import chrome from 'chrome-remote-interface';
import withLog from './log';

export default async () => {
	let launcher = new Launcher({
		chromeFlags: [
			'--window-size=1024,768',
			'--disable-gpu',
			'--headless',
			'--enable-logging',
			'--no-sandbox'
		]
	});
	launcher.pollInterval = 1000;

	await withLog(() => launcher.launch(), 'Launching Chrome');

	let protocol = await withLog(() => setup(launcher.port), 'Connecting to Chrome');

	return { launcher, protocol };
};

export const delay = time => new Promise(r => setTimeout(() => r(), time));

export const getElementHtml = async (Runtime, selector) => {
	let { result } = await Runtime.evaluate({ expression: `document.querySelector("${selector}").outerHTML` });
	return result.value;
};

export const waitUntil = async (Runtime, expression, retryCount = 10, retryInterval = 500) => {
	if (retryCount < 0) {
		throw new Error(`Wait until: '${expression}' timed out.`);
	}

	let { result } = await withLog(
		() => Runtime.evaluate({ expression }),
		`Waiting for ${expression} - tries left: ${retryCount}`
	);

	if (result && result.subtype === 'promise') {
		let message = await Runtime.awaitPromise({
			promiseObjectId: result.objectId,
			returnByValue: true
		});
		result = message.result;
	}

	if (!result || !result.value) {
		await delay(retryInterval);
		await waitUntil(Runtime, expression, retryCount - 1, retryInterval);
	}
};

export const loadPage = async (chrome, url, retryCount = 10, retryInterval = 5000) => {
	let result = await withLog(
		() => openPage(chrome, url, retryCount, retryInterval),
		`Navigating to ${url}`
	);
	await chrome.Page.loadEventFired();
	return result;
};

const openPage = async (chrome, url, retryCount, retryInterval) => {
	if (retryCount < 0) {
		throw new Error('Page could not be loaded!');
	}

	let result;
	try {
		result = await navigateToPage(chrome, url, retryInterval);
	} catch (e) {
		result = await openPage(chrome, url, retryCount - 1, retryInterval);
	}

	return result;
};

const setup = port => new Promise((resolve, reject) => {
	chrome({ port }, protocol => {
		const { Page, Runtime, Network, DOM, ServiceWorker } = protocol;

		Promise.all([
			Page.enable(),
			Runtime.enable(),
			Network.enable(),
			DOM.enable(),
			ServiceWorker.enable()
		]).then(() => {
			resolve(protocol);
		})
		.catch(reject);
		}).on('error', err =>  reject(new Error('Cannot connect to Chrome:' + err)));
});

const navigateToPage = (chrome, url, timeout) => new Promise(async (resolve, reject) => {
	let timer;

	let listener = (result) => {
		let { status, url: responseUrl } = result.response;
		if (responseUrl === url) {
			chrome.removeListener('Network.responseReceived', listener);
			clearTimeout(timer);
			return status < 400 ? resolve(result) : reject(status);
		}
	};

	timer = setTimeout(() => {
		chrome.removeListener('Network.responseReceived', listener);
		reject();
	}, timeout);

	chrome.on('Network.responseReceived', listener);
	await chrome.Page.navigate({ url });
});
