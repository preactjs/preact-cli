var isProd = (process.env.BABEL_ENV || process.env.NODE_ENV) === 'production';
/**
 * test env detection is used to default mode for
 * preset-env modules to "commonjs" otherwise, testing framework
 * will struggle
 */
var isTest = (process.env.BABEL_ENV || process.env.NODE_ENV) === 'test';

// default supported browser.
var defaultBrowserList = ['> 0.25%', 'IE >= 9'];

// preact-cli babel configs
var babelConfigs = require('../lib/lib/babel-config');

/**
 * preset as a function means allow users to override some options
 * like env, modules for environment
 */
module.exports = function preactCli(ctx, userOptions = {}) {
	// set default configs based on user environment
	var presetOptions = {
		env: isProd ? 'production' : 'development',
		modules: isTest ? 'commonjs' : false,
		browsers: defaultBrowserList,
	};

	// user specified options always the strongest
	Object.keys(presetOptions).forEach(function(key) {
		presetOptions[key] = userOptions[key] || presetOptions[key];
	});

	// yay! return the configs
	return babelConfigs(
		{ env: { production: presetOptions.env === 'production' } },
		{ modules: presetOptions.modules, browsers: presetOptions.browsers }
	);
};
