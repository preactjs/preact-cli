'use strict';

var utils = require('loader-utils');
var requireRelative = require('require-relative');

function proxyLoader(source, map) {
	var options = utils.getOptions(this);

	if (!this.query.__proxy_loader__) {
		this.query.__proxy_loader__ = { loader: options.loader, cwd: options.cwd };

		swapOptions(this, options.options);
	}
	var proxyOptions = this.query.__proxy_loader__;

	var loader;
	try {
		loader = requireRelative(proxyOptions.loader, proxyOptions.cwd);
	} catch (e) {
		loader = require(proxyOptions.loader);
	}

	return loader.call(this, source, map);
}

function swapOptions(loaderContext, newOptions) {
	var copy = {};
	var key = '';

	for (key in newOptions) {
		copy[key] = newOptions[key];
	}

	delete loaderContext.query.options;
	delete loaderContext.query.loader;
	delete loaderContext.query.cwd;

	for (key in copy) {
		loaderContext.query[key] = copy[key];
	}
}

module.exports = proxyLoader;