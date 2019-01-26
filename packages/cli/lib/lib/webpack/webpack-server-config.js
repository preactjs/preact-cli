const { resolve } = require('path');
const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');

function serverConfig(env) {
	return {
		entry: {
			'ssr-bundle': env.source('index.js'),
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(env.dest, 'ssr-build'),
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2',
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
