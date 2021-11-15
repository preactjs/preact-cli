const { resolve } = require('path');
const webpack = require('webpack');
const { stat } = require('fs').promises;
const { error } = require('../../util');

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
	env.config = configFile;
	let myConfig = resolve(env.cwd, env.config);

	try {
		await stat(myConfig);
	} catch (e) {
		if (isDefault) return;
		throw new Error(
			`preact-cli config could not be loaded!\nFile ${env.config} not found.`
		);
	}

	let m = require('esm')(module)(myConfig);

	// The line above results in an empty object w/ Jest,
	// so we need to do the following in order to load it:
	if (Object.keys(m).length === 0) {
		m = require(myConfig);
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
			throw new Error((`Error at ${myConfig}: \n` + err && err.stack) || err);
		}
	}
};

class WebpackConfigHelpers {
	constructor(cwd) {
		this._cwd = cwd;
	}

	get webpack() {
		return webpack;
	}

	getLoaders(config) {
		return this.getRules(config).map(({ rule, index }) => ({
			rule: rule,
			ruleIndex: index,
			loaders: rule.loaders || rule.use || rule.loader,
		}));
	}

	getRules(config) {
		return [
			...(config.module.loaders || []),
			...(config.module.rules || []),
		].map((rule, index) => ({ index, rule }));
	}

	getPlugins(config) {
		return (config.plugins || []).map((plugin, index) => ({ index, plugin }));
	}

	getRulesByMatchingFile(config, file) {
		let filePath = resolve(this._cwd, file);
		return this.getRules(config).filter(
			w => w.rule.test && w.rule.test.exec(filePath)
		);
	}

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

	getPluginsByName(config, name) {
		return this.getPlugins(config).filter(
			w =>
				w.plugin && w.plugin.constructor && w.plugin.constructor.name === name
		);
	}

	getPluginsByType(config, type) {
		return this.getPlugins(config).filter(w => w.plugin instanceof type);
	}
}
