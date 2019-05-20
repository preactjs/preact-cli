const { resolve } = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');

function serverConfig(env) {
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
			/** This makes pre-rendered bundle use the same preact as preact-cli.
			 * This is needed for the options object of preact-x.
			 * Note: This means any upgrade of preact in user land will not affect pre-rendered bundle.
			 */
			preact: require.resolve('preact'),
		},
		target: 'node',
		resolveLoader: {
			alias: {
				async: resolve(__dirname, './dummy-loader'),
			},
		},
	};
}

module.exports = function(env) {
	return merge(baseConfig(env), serverConfig(env));
};
