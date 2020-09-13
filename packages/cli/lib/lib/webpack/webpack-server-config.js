const { resolve } = require('path');
const SizePlugin = require('size-plugin');
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
			preact: 'preact',
		},
		target: 'node',
		resolveLoader: {
			alias: {
				async: resolve(__dirname, './dummy-loader'),
			},
		},
		plugins: [
			new SizePlugin({ filename: 'size-plugin-ssr.json' }),
		]
	};
}

module.exports = function(env) {
	return merge(baseConfig(env), serverConfig(env));
};
