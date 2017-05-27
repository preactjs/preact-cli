import path from 'path'
import fs from 'fs.promised'
import {
	webpack,
} from '@webpack-blocks/webpack2';

const getRules = config => [...(config.module.loaders || []), ...(config.module.rules || [])]
	.map((rule, index) => ({ index, rule }))

const getLoaders = config => getRules(config)
	.map(({ rule, index }) => ({
		rule: rule,
		ruleIndex: index,
		loaders: (rule.loaders || rule.use || rule.loader)
	}))

const getPlugins = config => (config.plugins || []).map((plugin, index) => ({ index, plugin }))

const helpers = cwd => ({
	webpack,

	getRulesByMatchingFile(config, file) {
		let filePath = path.resolve(cwd, file)
		return getRules(config)
			.filter(w => w.rule.test && w.rule.test.exec(filePath))
	},

	getLoadersByName(config, name) {
		return getLoaders(config)
			.map(({ rule, ruleIndex, loaders }) => Array.isArray(loaders)
				? loaders.map((loader, loaderIndex) => ({ rule, ruleIndex, loader, loaderIndex }))
				: [{ rule, ruleIndex, loader: loaders, loaderIndex: -1 }]
			)
			.reduce((arr, loaders) => arr.concat(loaders), [])
			.filter(({ loader }) => loader === name || (loader && loader.loader === name))
	},

	getPluginsByName(config, name) {
		return getPlugins(config).filter(w => w.plugin && w.plugin.constructor && w.plugin.constructor.name === name)
	},

	getPluginsByType(config, type) {
		return getPlugins(config).filter(w => w.plugin instanceof type)
	},
})

export default async function (env, config) {
	const transformerPath = path.resolve(env.cwd, env.config);
	try {
		await fs.stat(transformerPath);
	} catch (e) {
		return;
	}

	require('babel-register')();
	const m = require(transformerPath);
	const transformer = m && m.default || m;
	transformer(config, Object.assign({}, env), helpers(env.cwd))
}
