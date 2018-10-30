const { resolve } = require('path');
const webpack = require('webpack');
const fs = require('fs.promised');

const FILE = 'preact.config.js';

module.exports = async function (env, webpackConfig, ssr=false) {
	env.config = env.config || FILE;
	let myConfig = resolve(env.cwd, env.config);

	try {
		await fs.stat(myConfig);
	} catch (e) {
		if (env.config === FILE) return;
		throw new Error(`preact-cli config could not be loaded!\nFile ${env.config} not found.`);
	}

	require('@babel/register')({
		presets: [[require.resolve('@babel/preset-env'), {
			"targets": { "node": "current" }
		}]]
	});
	const m = require(myConfig);
	const config = m && m.default || m;
	try {
		let helpers = new WebpackConfigHelpers(env.cwd);
		const transformers = [];
		
		if (typeof config === 'function') {
			transformers.push(config);
		} else if (typeof config === 'object' && !Array.isArray(config)) {
			// TODO: do we want more props?
			if (config.plugins) {
				if (!Array.isArray(config.plugins)) {
					throw new Error('The `plugins` property in `preact.config.js` has to be an Array');
				}
				
				config.plugins.map((plugin, index) => {
					if (typeof plugin === 'function') {
						transformers.push(plugin);
					} else if (plugin && typeof plugin.apply === 'function') {
						transformers.push(plugin.apply.bind(plugin));
					} else {
						//
						let name = plugin && plugin.prototype && plugin.prototype.constructor && plugin.prototype.constructor.name;
						
						console.error(`Plugin invalid (index: ${index}, name: ${name})\nHas to be a function or an object/class with an \`apply\` function, is: ${typeof plugin}`);
					}
				});
			}
			if (config.transformWebpack) {
				if (typeof config.transformWebpack !== 'function') {
					throw new Error('The `transformWebpack` property in `preact.config.js` has to be a Function');
				}
				transformers.push(config.transformWebpack);
			}
		} else {
			throw new Error('Invalid export in `preact.config.js`, should be an object or a function');
		}
		
		for (let transformer of transformers) {
			await transformer(webpackConfig, Object.assign({}, env, { ssr }), helpers);
		}
	} catch (err) {
		throw new Error(`Error at ${myConfig}: \n` + err && err.stack || err);
	}
};

/**
 * WebpackConfigHelpers
 *
 * @class WebpackConfigHelpers
 */
class WebpackConfigHelpers {
	constructor(cwd) {
		this._cwd = cwd;
	}

	/**
	 * Webpack module used to create config.
	 *
	 * @readonly
	 * @returns {object}
	 * @memberof WebpackConfigHelpers
	 */
	get webpack() {
		return webpack;
	}

	/**
	 * Returns wrapper around all loaders from config.
	 *
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @returns {LoaderWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getLoaders(config) {
		return this.getRules(config).map(({ rule, index }) => ({
			rule: rule,
			ruleIndex: index,
			loaders: (rule.loaders || rule.use || rule.loader)
		}));
	}

	/**
	 * Returns wrapper around all rules from config.
	 *
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @returns {RuleWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getRules(config) {
		return [...(config.module.loaders || []), ...(config.module.rules || [])]
			.map((rule, index) => ({ index, rule }));
	}

	/**
	 * Returns wrapper around all plugins from config.
	 *
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @returns {PluginWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPlugins(config) {
		return (config.plugins || []).map((plugin, index) => ({ index, plugin }));
	}

	/**
	 *
	 *
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @param {string} file - path to test against loader. Resolved relatively to $PWD.
	 * @returns {RuleWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getRulesByMatchingFile(config, file) {
		let filePath = resolve(this._cwd, file);
		return this.getRules(config)
			.filter(w => w.rule.test && w.rule.test.exec(filePath));
	}

	/**
	 * Returns loaders that match provided name.
	 *
	 * @example
	 * helpers.getLoadersByName(config, 'less-loader')
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @param {string} name - name of loader.
	 * @returns {LoaderWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getLoadersByName(config, name) {
		return this.getLoaders(config)
			.map(({ rule, ruleIndex, loaders }) => Array.isArray(loaders)
				? loaders.map((loader, loaderIndex) => ({ rule, ruleIndex, loader, loaderIndex }))
				: [{ rule, ruleIndex, loader: loaders, loaderIndex: -1 }]
			)
			.reduce((arr, loaders) => arr.concat(loaders), [])
			.filter(({ loader }) => loader === name || (loader && loader.loader === name));
	}

	/**
	 * Returns plugins that match provided name.
	 *
	 * @example
	 * helpers.getPluginsByName(config, 'HtmlWebpackPlugin')
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @param {string} name - name of loader.
	 * @returns {PluginWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPluginsByName(config, name) {
		return this.getPlugins(config)
			.filter(w => w.plugin && w.plugin.constructor && w.plugin.constructor.name === name);
	}

	/**
	 * Returns plugins that match provided type.
	 *
	 * @example
	 * helpers.getPluginsByType(config, webpack.optimize.CommonsChunkPlugin)
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @param {any} type - type of plugin.
	 * @returns {PluginWrapper[]}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPluginsByType(config, type) {
		return this.getPlugins(config)
			.filter(w => w.plugin instanceof type);
	}

	/**
	 * Sets template used by HtmlWebpackPlugin.
	 *
	 * @param {object} config - [webpack config](https://webpack.js.org/configuration/#options).
	 * @param {string} template - template path. See [HtmlWebpackPlugin docs](https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md).
	 *
	 * @memberof WebpackConfigHelpers
	 */
	setHtmlTemplate(config, template) {
		let isPath;
		try {
			fs.statSync(template);
			isPath = true;
		} catch (e) {}

		let templatePath = isPath ? `!!ejs-loader!${resolve(this._cwd, template)}` : template;
		let { plugin: htmlWebpackPlugin } = this.getPluginsByName(config, 'HtmlWebpackPlugin')[0];
		htmlWebpackPlugin.options.template = templatePath;
	}
}

/**
 * Wrapper around webpack's [loader entry](https://webpack.js.org/configuration/module/#useentry).
 *
 * @typedef {object} LoaderWrapper
 * @property {object} rule - [rule entry](https://webpack.js.org/configuration/module/#module-rules).
 * @property {number} ruleIndex - index of rule in config.
 * @property {object} loader - [loader entry](https://webpack.js.org/configuration/module/#useentry).
 * @property {number} loaderIndex - index of loader in rule.
 */

/**
 * Wrapper around webpack's [rule](https://webpack.js.org/configuration/module/#module-rules).
 *
 * @typedef {object} RuleWrapper
 * @property {object} rule - [rule entry](https://webpack.js.org/configuration/module/#module-rules).
 * @property {number} index - index of rule in config.
 */

/**
 * Wrapper around webpack's [plugin](https://webpack.js.org/configuration/plugins/#plugins).
 *
 * @typedef {object} PluginWrapper
 * @property {object} plugin - [plugin entry](https://webpack.js.org/configuration/plugins/#plugins).
 * @property {number} index - index of plugin in config.
 */
