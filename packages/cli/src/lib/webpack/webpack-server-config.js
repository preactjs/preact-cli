const webpack = require('webpack');
const { resolve } = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack-base-config');

/**
 * @returns {import('webpack').Configuration}
 */
function serverConfig(config) {
	return {
		entry: {
			'ssr-bundle': config.source('index'),
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(config.dest, 'ssr-build'),
			libraryTarget: 'commonjs2',
		},
		externals: {
			preact: 'preact',
		},
		target: 'node',
		plugins: [
			new webpack.optimize.LimitChunkCountPlugin({
				maxChunks: 1,
			}),
		],
		optimization: {
			minimize: false,
		},
	};
}

/**
 * @param {import('../../../types').Env} env
 */
module.exports = function createServerConfig(config, env) {
	return merge(baseConfig(config, env), serverConfig(config));
};
