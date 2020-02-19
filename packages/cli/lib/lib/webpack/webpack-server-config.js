const { resolve } = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');
const { filter } = require('minimatch');

function serverConfig(env) {
	const asyncLoader = resolve(__dirname, './dummy-loader');
	const { source } = env;
	return {
		entry: {
			'ssr-bundle': env.source('index'),
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(env.dest, 'ssr-build'),
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2',
		},
		externals: {
			preact: 'preact',
		},
		target: 'node',
		resolveLoader: {
			alias: {
				async: asyncLoader,
			},
		},
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					include: [
						filter(source('routes') + '/{*,*/index}.{js,jsx,ts,tsx}'),
						filter(
							source('components') + '/{routes}/{*,*/index}.{js,jsx,ts,tsx}'
						),
					],
					loader: asyncLoader,
				},
			],
		},
	};
}

module.exports = function(env) {
	return merge(baseConfig(env), serverConfig(env));
};
