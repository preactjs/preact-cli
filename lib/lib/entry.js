'use strict';

var _preact = require('preact');

if (process.env.NODE_ENV === 'development') {
	require('preact/debug');
} else if (process.env.ADD_SW && 'serviceWorker' in navigator && location.protocol === 'https:') {
	navigator.serviceWorker.register(__webpack_public_path__ + 'sw.js');
}

const interopDefault = m => m && m.default ? m.default : m;

let app = interopDefault(require('preact-cli-entrypoint'));

if (typeof app === 'function') {
	let root = document.body.firstElementChild;

	let init = () => {
		let app = interopDefault(require('preact-cli-entrypoint'));
		root = (0, _preact.render)((0, _preact.h)(app), document.body, root);
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}