import { h, render } from 'preact';

if (process.env.NODE_ENV==='development') {
	// enable preact devtools
	require('preact/devtools');
}
else if (process.env.ADD_SW && 'serviceWorker' in navigator && location.protocol === 'https:') {
	// eslint-disable-next-line no-undef
	navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js');
}


const interopDefault = m => m && m.default ? m.default : m;

let app = interopDefault(require('preact-cli-entrypoint'));

if (typeof app==='function') {
	let root = document.body.firstElementChild;

	let init = () => {
		let app = interopDefault(require('preact-cli-entrypoint'));
		root = render(h(app), document.body, root);
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}
