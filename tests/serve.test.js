import test from './async-test';
import htmlLooksLike from 'html-looks-like';
import { create, build, serve } from './lib/cli';
import startChrome, { delay, loadPage, waitUntil, getElementHtml } from './lib/chrome';
import { setup, clean } from './lib/output';
import { homePageHTML, profilePageHtml } from './serve.snapshot';

const options = { timeout: 60 * 1000 };
let chrome, launcher;

test('preact serve - before', options, async () => {
	await setup();
	let result = await startChrome();
	chrome = result.protocol;
	launcher = result.launcher;
});

test(`preact serve - should spawn server hosting the app.`, options, async t => {
	let { Runtime } = chrome;
	let app = await create('app');
	await build(app);
	let server = await serve(app, 8081);

	await loadPage(chrome, 'https://localhost:8081/');
	await pageIsInteractive(chrome);
	let html = await getElementHtml(Runtime, 'body');
	await server.kill();

	htmlLooksLike(html, homePageHTML);
	t.pass();
});

test(`preact serve - should serve interactive page.`, options, async t => {
	let { Runtime } = chrome;
	let app = await create('app');
	await build(app);
	let server = await serve(app, 8081);
	let url = 'https://localhost:8081/';

	await loadPage(chrome, url);
	await pageIsInteractive(chrome);
	await Runtime.evaluate({ expression: `document.querySelector('a[href="/profile"]').click()` });
	await waitUntil(Runtime, `document.querySelector('div > h1').innerText === 'Profile: me'`);

	let html = await getElementHtml(Runtime, 'body');
	await server.kill();

	htmlLooksLike(html, profilePageHtml);
	t.pass();
});

test(`preact serve - should register service worker on first visit.`, options, async t => {
	let { Runtime } = chrome;
	let app = await create('app');
	await build(app);
	let server = await serve(app, 8081);
	let url = 'https://localhost:8081/';

	await loadPage(chrome, url);
	await pageIsInteractive(chrome);

	await waitUntil(Runtime, `
		navigator.serviceWorker
			.getRegistration()
			.then(r => !!r && !!r.active && r.active.state === 'activated')
	`);

	await server.kill();

	await loadPage(chrome, url);
	await pageIsInteractive(chrome);
	let html = await getElementHtml(Runtime, 'body');

	htmlLooksLike(html, homePageHTML);
	t.pass();
});

test(`preact serve - after`, options, async () => {
	await clean();
	await unregisterSW('https://localhost:8081/');
	await chrome.close();
	await launcher.kill();
});

const unregisterSW = async url => {
	let { ServiceWorker } = chrome;
	await ServiceWorker.unregister({ scopeURL: url });
};

export const pageIsInteractive = async (chrome, retryCount = 10, retryInterval = 200) => {
	if (retryCount < 0) {
		throw new Error('Waiting for page interactivity timeout out.');
	}

	let { DOM, DOMDebugger } = chrome;
	let { root: document} = await DOM.getDocument();
	let a = await DOM.querySelector({ selector: 'a', nodeId: document.nodeId });
	let { object } = await DOM.resolveNode({ nodeId: a.nodeId });
	let { listeners } = await DOMDebugger.getEventListeners({ objectId: object.objectId });

	if (!listeners.some(l => l.type === 'click')) {
		await delay(retryInterval);
		await pageIsInteractive(chrome, retryCount - 1, retryInterval);
	}
};
