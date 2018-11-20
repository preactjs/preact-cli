const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');
const { InjectManifest } = require('workbox-webpack-plugin');
const { resolve, join } = require('path');

function swConfig(config) {
  const { dest, src, sw } = config;
  if (!sw) {
    return {};
  }
  let swSrc = resolve(__dirname, './../sw.js');
	// TODO(prateekbh): Check if sw.js exist in user land an swap it here.
  return {
    entry: {
      sw: swSrc,
    },
    target: 'webworker',
		output: {
			path: dest,
			publicPath: '/',
			filename: '[name].js',
    },
    plugins: [
      // new InjectManifest({
      //   swSrc: 'sw.js',
      // }),
      new webpack.DefinePlugin({
				'process.env.ES_BUILD': false,
			})
    ]
  }
}

module.exports = function (env) {
	return merge(
		baseConfig(env),
		swConfig(env),
	);
};