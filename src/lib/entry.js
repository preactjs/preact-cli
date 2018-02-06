import { h, render } from 'preact';

if (process.env.NODE_ENV==='development') {
	// enable preact devtools
	require('preact/devtools');
}
else if (process.env.ADD_SW && 'serviceWorker' in navigator && location.protocol === 'https:') {
	// eslint-disable-next-line no-undef
	navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js');
}

function getApp() {
	let x = require('preact-cli-entrypoint');
	return h(x && x.default || x);
}

let inProgress = false;
let body = document.body;
let root = body.firstElementChild;

function init(first) {
	if (inProgress) return;

	let app = getApp();

	if (first) {
		render(app, body.cloneNode(true));
	} else {
		root = render(app, body, root);
	}
}

if (module.hot) {
	module.hot.accept('preact-cli-entrypoint', init);
}

addEventListener('async-loading', () => {
	inProgress = true;
});

addEventListener('async-loaded', () => {
	inProgress = false;
	init();
});

init(true);
