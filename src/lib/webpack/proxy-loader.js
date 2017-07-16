var utils = require('loader-utils');
var requireRelative = require('require-relative');

function proxyLader(source, map) {
	var options = utils.getOptions(this);

	// First loader run store passed options & remove proxy-loader specific
	if (!this.query.__proxy_loader__) {
		this.query.__proxy_loader__ = { loader: options.loader, cwd: options.cwd };

		// remove proxy-loader options and make this.query act as requested loader query
		swapOptions(this, options);
	}
	// Save it for future calls that use this loader (via this.addDependency)
	var proxyOptions = this.query.__proxy_loader__;

	var loader;
	try {
		loader = requireRelative(proxyOptions.loader, proxyOptions.cwd);
	} catch (e) {
		loader = require(proxyOptions.loader);
	}

	// run loader
	return loader.bind(this)(source, map);
}

function swapOptions(loaderContext, newOptions) {
	var copy = {};
	var key = '';

	for (key in loaderContext.options) {
		copy[key] = newOptions[key];
	}

	delete loaderContext.query.options;
	delete loaderContext.query.loader;
	delete loaderContext.query.cwd;

	for (key in copy) {
		loaderContext.query[key] = copy[key];
	}
}

module.exports = proxyLader;
