import { Launcher } from 'chrome-launcher';
import chrome from 'chrome-remote-interface';
import { log, waitUntil } from './utils';

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

	await log(() => launcher.launch(), 'Launching Chrome');

	let protocol = await log(() => setup(launcher.port), 'Connecting to Chrome');

	return { launcher, protocol };
};


export const getElementHtml = async (Runtime, selector) => {
	let { result } = await Runtime.evaluate({ expression: `document.querySelector("${selector}").outerHTML` });
	return result.value;
};

export const waitUntilExpression = async (Runtime, expression, retryCount = 10, retryInterval = 500) => {
	let evaluate = async () => {
		let { result } = await log(
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

		return result && result.value;
	};

	await waitUntil(evaluate, `Waiting for ${expression} timed out!`, retryCount, retryInterval);
};

export const loadPage = async (chrome, url) => {
	let result = await log(
		() => waitUntil(() => navigateToPage(chrome, url, 5000), `${url} could not be loaded!`),
		`Navigating to ${url}`
	);
	await chrome.Page.loadEventFired();
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
