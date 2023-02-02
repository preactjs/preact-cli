/* global __webpack_public_path__ */

import { h, render, hydrate } from 'preact';

const interopDefault = m => (m && m.default ? m.default : m);

const normalizeURL = url => (url[url.length - 1] === '/' ? url : url + '/');

if (process.env.NODE_ENV === 'development') {
	// enable preact devtools
	require('preact/debug');

	// only add a debug sw if webpack service worker is not requested.
	if (process.env.ADD_SW === undefined && 'serviceWorker' in navigator) {
		navigator.serviceWorker.register(
			normalizeURL(__webpack_public_path__) + 'sw-debug.js'
		);
	} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
		navigator.serviceWorker.register(
			normalizeURL(__webpack_public_path__) + 'sw.js'
		);
	}
} else if (process.env.ADD_SW && 'serviceWorker' in navigator) {
	navigator.serviceWorker.register(
		normalizeURL(__webpack_public_path__) + 'sw.js'
	);
}

const App = interopDefault(require('preact-cli-entrypoint'));

if (typeof App === 'function') {
	const init = () => {
		const prerenderDataElement = document.querySelector(
			'script[type="__PREACT_CLI_DATA__"]'
		);
		let prerenderData = {};

		const root =
			(prerenderDataElement && prerenderDataElement.parentElement) ||
			document.body;

		if (prerenderDataElement) {
			prerenderData =
				JSON.parse(decodeURI(prerenderDataElement.innerHTML)).prerenderData ||
				prerenderData;
		}

		/* An object named CLI_DATA is passed as a prop,
		 * this keeps us future proof if in case we decide,
		 * to send other data like at some point in time.
		 */
		const CLI_DATA = { prerenderData };
		const currentURL = prerenderData.url ? normalizeURL(prerenderData.url) : '';

		if (
			prerenderDataElement &&
			currentURL === normalizeURL(location.pathname)
		) {
			hydrate(h(App, { CLI_DATA }), root);
		} else {
			render(h(App, { CLI_DATA }), root);
		}
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}
