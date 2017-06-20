import { resolve } from 'path';
import createBabelConfig from './babel-config';

export default function prerender(config, params) {
	params = params || {};

	let entry = resolve(config.cwd, config.src || 'src', 'index.js'),
		url = params.url || '/';

	require('babel-register')({
		babelrc: false,
		ignore: false,
		...createBabelConfig(config, { modules: 'commonjs' })
	});

	global.location = { href:url, pathname:url };
	global.history = {};

	// install CSS modules (just to generate correct classNames and support importing CSS & LESS)
	require('css-modules-require-hook')({
		rootDir: resolve(config.cwd, config.src || 'src'),
		generateScopedName: '[local]__[hash:base64:5]',
		extensions: ['.less', '.css'],
		processorOpts: { parser: require('postcss-less').parse }
	});

	// strip webpack loaders from import names
	let { Module } = require('module');
	let oldResolve = Module._resolveFilename;
	Module._resolveFilename = function (request, parent, isMain) {
		request = request.replace(/^.*\!/g, '');
		return oldResolve.call(this, request, parent, isMain);
	};

	require('./polyfills');

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

	// restore resolution without loader stripping
	Module._resolveFilename = oldResolve;

	return html;
}
