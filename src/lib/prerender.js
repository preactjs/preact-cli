import { resolve } from 'path';

export default function prerender(outputFilename, params) {
	params = params || {};

	let entry = resolve(__dirname, './ssr-build', outputFilename),
		url = params.url || '/';

	global.location = { href:url, pathname:url };
	global.history = {};

	let m = require(entry),
		app = m && m.default || m;

	if (typeof app!=='function') {
		// eslint-disable-next-line no-console
		console.warn('Entry does not export a Component function/class, aborting prerendering.');
		return '';
	}

	let preact = require('preact'),
		renderToString = require('preact-render-to-string');

	let html = renderToString(preact.h(app, { url }));

	return html;
}
