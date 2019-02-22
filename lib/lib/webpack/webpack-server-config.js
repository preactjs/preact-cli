'use strict';

exports.__esModule = true;

exports.default = function (env) {
	env = Object.assign({}, env, { ssr: true });
	return (0, _webpackMerge2.default)((0, _webpackBaseConfig2.default)(env), serverConfig(env));
};

var _path = require('path');

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _webpackBaseConfig = require('./webpack-base-config');

var _webpackBaseConfig2 = _interopRequireDefault(_webpackBaseConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function serverConfig(env) {
	return {
		entry: {
			'ssr-bundle': env.source('index.js')
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: (0, _path.resolve)(env.dest, 'ssr-build'),
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2'
		},
		target: 'node',
		resolveLoader: {
			alias: {
				async: (0, _path.resolve)(__dirname, './dummy-loader')
			}
		}
	};
}