import { h, render } from 'preact';

if (process.env.NODE_ENV==='development') {
	// enable preact devtools
	require('preact/devtools');
} else if ('serviceWorker' in navigator && location.protocol === 'https:') {
	navigator.serviceWorker.register('/sw.js');
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
	console.log('>> inside init', first);

	let app = getApp();

	if (first) {
		console.info('~~> init fake render!');
		render(app, body.cloneNode(true));
	} else {
		console.log('>>> NOT first render, update');
		root = render(app, body, root);
		console.log('~> new root', root);
	}
	console.log('~~~~~~');
}

if (module.hot) {
	module.hot.accept('preact-cli-entrypoint', init);
}

addEventListener('async-loading', () => {
	console.log('inside async-loading');
	(inProgress=true);
});

addEventListener('async-loaded', () => {
	console.log('inside async-loaded');
	inProgress=false; init();
});

init(true);
