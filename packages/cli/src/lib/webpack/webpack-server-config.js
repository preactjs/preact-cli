const { resolve } = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack-base-config');

/**
 * @returns {import('webpack').Configuration}
 */
function serverConfig(env) {
	return {
		entry: {
			'ssr-bundle': env.source('index'),
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(env.dest, 'ssr-build'),
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
		optimization: {
			minimize: false,
		},
	};
}

module.exports = function createServerConfig(env) {
	return merge(baseConfig(env), serverConfig(env));
};
