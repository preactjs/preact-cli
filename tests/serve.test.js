import looksLike from 'html-looks-like';
import { create, build, serve } from './lib/cli';
import startChrome, { loadPage,  waitUntilExpression, getElementHtml } from './lib/chrome';
import { waitUntil } from './lib/utils';
import images from './images/serve';

let chrome, launcher, server;

describe('preact serve', () => {
	beforeAll(async () => {
		let result = await startChrome();
		chrome = result.protocol;
		launcher = result.launcher;
	});

	afterAll(async () => {
		await unregisterSW('https://localhost:8081/');
		await chrome.close();
		await launcher.kill();
	});

	beforeEach(() => {
		server = undefined;
	});

	afterEach(async () => {
		if (server) await server.kill();
	});

	it(`should spawn server hosting the app.`, async () => {
		let { Runtime } = chrome;
		let app = await create('default');
		await build(app);
		server = await serve(app, 8081);

		await loadPage(chrome, 'https://localhost:8081/');
		await pageIsInteractive(chrome);
		let html = await getElementHtml(Runtime, 'body');

		looksLike(html, images.home);
	});

	it(`should serve interactive page.`, async () => {
		let { Runtime } = chrome;
		let app = await create('default');
		await build(app);
		server = await serve(app, 8081);
		let url = 'https://localhost:8081/';

		await loadPage(chrome, url);
		await pageIsInteractive(chrome);
		await Runtime.evaluate({ expression: `document.querySelector('a[href="/profile"]').click()` });
		await waitUntilExpression(
			Runtime,
			`document.querySelector('div > h1').innerText === 'Profile: me'`
		);

		let html = await getElementHtml(Runtime, 'body');

		looksLike(html, images.profile);
	});

	it(`should register service worker on first visit.`, async () => {
		let { Runtime } = chrome;
		let app = await create('default');
		await build(app);
		server = await serve(app, 8081);
		let url = 'https://localhost:8081/';

		await loadPage(chrome, url);
		await pageIsInteractive(chrome);

		await waitUntilExpression(Runtime, `
			navigator.serviceWorker
				.getRegistration()
				.then(r => !!r && !!r.active && r.active.state === 'activated')
		`);

		await server.kill();
		server = undefined;

		await loadPage(chrome, url);
		await pageIsInteractive(chrome);
		let html = await getElementHtml(Runtime, 'body');

		looksLike(html, images.home);
	});
});

const unregisterSW = async url => {
	let { ServiceWorker } = chrome;
	await ServiceWorker.unregister({ scopeURL: url });
};

export const pageIsInteractive = chrome => waitUntil(
	async () => {
		let { DOM, DOMDebugger } = chrome;
		let { root: document} = await DOM.getDocument();
		let a = await DOM.querySelector({ selector: 'a', nodeId: document.nodeId });
		let { object } = await DOM.resolveNode({ nodeId: a.nodeId });
		let { listeners } = await DOMDebugger.getEventListeners({ objectId: object.objectId });

		return listeners.some(l => l.type === 'click');
	},
	'Waiting for page interactivity timeout out.',
	20,
	100
);

