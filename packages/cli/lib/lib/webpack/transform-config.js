const { resolve } = require('path');
const webpack = require('webpack');
const { stat } = require('fs').promises;
const { error, esmImport, tryResolveConfig, warn } = require('../../util');

const FILE = 'preact.config';
const EXTENSIONS = ['js', 'json'];

async function findConfig(env) {
	let idx = 0;
	for (idx; idx < EXTENSIONS.length; idx++) {
		let config = `${FILE}.${EXTENSIONS[idx]}`;
		let path = resolve(env.cwd, config);
		try {
			await stat(path);
			return { configFile: config, isDefault: true };
		} catch (e) {}
	}

	return { configFile: 'preact.config.js', isDefault: true };
}

function parseConfig(config) {
	const transformers = [];
	const addTransformer = (fn, opts = {}) => transformers.push([fn, opts]);

	if (typeof config === 'function') {
		addTransformer(config);
	} else if (typeof config === 'object' && !Array.isArray(config)) {
		if (config.plugins && !Array.isArray(config.plugins))
			throw new Error(
				'The `plugins` property in the preact config has to be an array'
			);

		config.plugins &&
			config.plugins.map((plugin, index) => {
				if (typeof plugin === 'function') {
					return plugin;
				} else if (plugin && typeof plugin.apply === 'function') {
					return plugin.apply.bind(plugin);
				} else if (Array.isArray(plugin)) {
					const [path, opts] = plugin;
					const m = require(path);
					const fn = (m && m.default) || m;

					if (typeof fn !== 'function') {
						return () =>
							error(
								`The plugin ${path} does not seem to be a function or a class`
							);
					}

					// Detect webpack plugins and return wrapper transforms that inject them
					if (typeof fn.prototype.apply === 'function') {
						return config => {
							config.plugins.push(new fn(opts));
						};
					}

					return addTransformer(fn, opts);
				} else if (typeof plugin === 'string') {
					return addTransformer(require(plugin));
				} else {
					let name =
						plugin &&
						plugin.prototype &&
						plugin.prototype.constructor &&
						plugin.prototype.constructor.name;

					return () =>
						error(
							`Plugin invalid (index: ${index}, name: ${name})\nHas to be a function or an object/class with an \`apply\` function, is: ${typeof plugin}`
						);
				}
			});

		if (config.webpack) {
			if (typeof config.webpack !== 'function')
				throw new Error(
					'The `transformWebpack` property in the preact config has to be a function'
				);

			addTransformer(config.webpack);
		}
	} else {
		throw new Error(
			'Invalid export in the preact config, should be an object or a function'
		);
	}
	return transformers;
}

module.exports = async function (env, webpackConfig, isServer = false) {
	const { configFile, isDefault } =
		env.config !== 'preact.config.js'
			? { configFile: env.config, isDefault: false }
			: await findConfig(env);

	const cliConfig = tryResolveConfig(
		env.cwd,
		configFile,
		isDefault,
		env.verbose
	);

	if (!cliConfig) return;

	let m;
	try {
		m = esmImport(cliConfig);
	} catch (error) {
		warn(
			`Failed to load preact-cli config file, using default!\n${
				env.verbose ? error.stack : error.message
			}`
		);
		return;
	}

	const transformers = parseConfig((m && m.default) || m);

	const helpers = new WebpackConfigHelpers(env.cwd);
	for (let [transformer, options] of transformers) {
		try {
			await transformer(
				webpackConfig,
				Object.assign({}, env, {
					isServer,
					dev: !env.production,
					ssr: isServer,
				}),
				helpers,
				options
			);
		} catch (err) {
			throw new Error((`Error at ${cliConfig}: \n` + err && err.stack) || err);
		}
	}
};

/**
 * WebpackConfigHelpers
 *
 * @typedef {import('../../../types.js').Helpers} Helpers
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
	 * @type {Helpers['webpack']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	get webpack() {
		return webpack;
	}

	/**
	 * Returns wrapper around all loaders from config.
	 *
	 * @type {Helpers['getLoaders']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getLoaders(config) {
		return this.getRules(config).map(({ rule, index }) => ({
			rule: rule,
			ruleIndex: index,
			loaders: rule.loaders || rule.use || rule.loader,
		}));
	}

	/**
	 * Returns wrapper around all rules from config.
	 *
	 * @type {Helpers['getRules']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getRules(config) {
		return [
			...(config.module.loaders || []),
			...(config.module.rules || []),
		].map((rule, index) => ({ index, rule }));
	}

	/**
	 * Returns wrapper around all plugins from config.
	 *
	 * @type {Helpers['getPlugins']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPlugins(config) {
		return (config.plugins || []).map((plugin, index) => ({ index, plugin }));
	}

	/**
	 * Returns wrapper around all rules that match provided file.
	 *
	 * @type {Helpers['getRulesByMatchingFile']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getRulesByMatchingFile(config, file) {
		let filePath = resolve(this._cwd, file);
		return this.getRules(config).filter(
			w => w.rule.test && w.rule.test.exec(filePath)
		);
	}

	/**
	 * Returns loaders that match provided name.
	 *
	 * @example
	 * helpers.getLoadersByName(config, 'less-loader')
	 *
	 * @type {Helpers['getLoadersByName']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getLoadersByName(config, name) {
		return this.getLoaders(config)
			.map(({ rule, ruleIndex, loaders }) =>
				Array.isArray(loaders)
					? loaders.map((loader, loaderIndex) => ({
							rule,
							ruleIndex,
							loader,
							loaderIndex,
					  }))
					: [{ rule, ruleIndex, loader: loaders, loaderIndex: -1 }]
			)
			.reduce((arr, loaders) => arr.concat(loaders), [])
			.filter(
				({ loader }) =>
					(typeof loader === 'string' && loader.includes(name)) ||
					(typeof loader.loader === 'string' && loader.loader.includes(name))
			);
	}

	/**
	 * Returns plugins that match provided name.
	 *
	 * @example
	 * helpers.getPluginsByName(config, 'HtmlWebpackPlugin')
	 *
	 * @type {Helpers['getPluginsByName']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPluginsByName(config, name) {
		return this.getPlugins(config).filter(
			w =>
				w.plugin && w.plugin.constructor && w.plugin.constructor.name === name
		);
	}

	/**
	 * Returns plugins that match provided type.
	 *
	 * @example
	 * helpers.getPluginsByType(config, webpack.optimize.CommonsChunkPlugin)
	 *
	 * @type {Helpers['getPluginsByType']}
	 *
	 * @memberof WebpackConfigHelpers
	 */
	getPluginsByType(config, type) {
		return this.getPlugins(config).filter(w => w.plugin instanceof type);
	}
}
