import test from './async-test';
import htmlLooksLike from 'html-looks-like';
import { create, build, serve } from './lib/cli';
import startChrome, { loadPage, waitUntil } from './lib/chrome';
import { setup, clean } from './lib/output';

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
	let { result } = await Runtime.evaluate({ expression: 'document.querySelector("body").outerHTML' });
	await server.kill();

	htmlLooksLike(result.value, homePageHTML);
	t.pass();
});

test(`preact serve - should serve interactive page.`, options, async t => {
	let { Runtime } = chrome;
	let app = await create('app');
	await build(app);
	let server = await serve(app, 8081);
	let url = 'https://localhost:8081/';

	await loadPage(chrome, url);
	await Runtime.evaluate({ expression: `document.querySelector('a[href="/profile"]').click()` });
	await waitUntil(Runtime, `document.querySelector('div > h1').innerText === 'Profile: me'`);

	let { result } = await Runtime.evaluate({ expression: `document.querySelector('body').outerHTML` });

	await server.kill();
	htmlLooksLike(result.value, profilePageHtml);
	t.pass();
});

test(`preact serve - should register service worker on first visit.`, options, async t => {
	let { Runtime } = chrome;

	await loadPage(chrome, 'https://localhost:8081/');
	let { result } = await Runtime.evaluate({ expression: 'document.querySelector("body").outerHTML' });

	htmlLooksLike(result.value, homePageHTML);
	t.pass();
});

test(`preact serve - after`, options, async () => {
	await clean();
	await unregisterSW();
	await chrome.close();
	await launcher.kill();
});

const unregisterSW = async () => {
	let { Runtime } = chrome;
	await Runtime.evaluate({
		expression: `
			Promise.resolve(navigator.serviceWorker)
					.then(sw => sw && sw.getRegistration())
					.then(r => r && r.unregister())
					.catch(() => false)
					.then(() => window._sw_unregistered_ = true);
		`
	});
	await waitUntil(Runtime, `window._sw_unregistered_ === true`);
};

const homePageHTML = `
<body>
	<div id="app">
		<header class="header__3fP58">
			<h1>Preact App</h1>
			<nav>
				<a href="/" class="active__2aRKV">Home</a>
				<a href="/profile" class="">Me</a>
				<a href="/profile/john" class="">John</a>
			</nav>
		</header>
		<div class="home__MVGbg">
			<h1>Home</h1>
			<p>This is the Home component.</p>
		</div>
	</div>
	<script src="/bundle.js" async=""></script>
</body>
`;

const profilePageHtml = `
<body>
	<div id="app">
		<header class="header__3fP58">
			<h1>Preact App</h1>
			<nav>
				<a href="/" class="">Home</a>
				<a href="/profile" class="active__2aRKV">Me</a>
				<a href="/profile/john" class="">John</a>
			</nav>
		</header>
		<div class="profile__1fPRW">
			<h1>Profile: me</h1>
			<p>This is the user profile for a user named me.</p>
			<div>{{ ... }}</div>
			<p><button>Click Me</button> Clicked 10 times.</p>
		</div>
	</div>
	<script src="/bundle.js" async=""></script>
</body>
`;
