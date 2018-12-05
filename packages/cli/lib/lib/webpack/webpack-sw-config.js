const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack-base-config');
const BabelEsmPlugin = require('babel-esm-plugin');
const fs = require('fs');
const {yellow} = require('chalk');
const { resolve } = require('path');

function swConfig(config) {
  const { dest, src, brotli, esm } = config;

  const plugins = [
    new webpack.DefinePlugin({
      'process.env.ES_BUILD': false,
      'process.env.ENABLE_BROTLI': brotli,
      'process.env.NODE_ENV': 'production',
    }),
  ];

  esm && plugins.push(
    new BabelEsmPlugin({
      filename: '[name]-esm.js',
      beforeStartExecution: (plugins) => {
        plugins.forEach(plugin => {
          if (plugin.constructor.name === 'DefinePlugin' && plugin.definitions) {
            for (const definition in plugin.definitions) {
              if (definition === 'process.env.ES_BUILD') {
                plugin.definitions[definition] = true;
              }
            }
          } else if (plugin.constructor.name === 'DefinePlugin' && !plugin.definitions) {
            throw new Error('WebpackDefinePlugin found but not `process.env.ES_BUILD`.');
          }
        });
      }
    })
  );

  let swSrc = resolve(__dirname, './../sw.js');
  if (fs.existsSync(resolve(`${src}/sw.js`))) {
    console.log(yellow('⚛️ Info - CLI found sw.js in source root folder, using that to compile the final service worker instead'));
    swSrc = resolve(`${src}/sw.js`);
  }

  return {
    context: src,
    entry: {
      sw: swSrc,
    },
    target: 'webworker',
		output: {
			path: dest,
			publicPath: '/',
			filename: '[name].js',
    },
    plugins,
  };
}

module.exports = function (env) {
	return merge(baseConfig(env), swConfig(env));
};