'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (env) {
	return (0, _webpackMerge2.default)((0, _webpackBaseConfig2.default)(env), clientConfig(env), (env.isProd ? isProd : isDev)(env));
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _fs = require('fs');

var _webpackMerge = require('webpack-merge');

var _webpackMerge2 = _interopRequireDefault(_webpackMerge);

var _minimatch = require('minimatch');

var _copyWebpackPlugin = require('copy-webpack-plugin');

var _copyWebpackPlugin2 = _interopRequireDefault(_copyWebpackPlugin);

var _swPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');

var _swPrecacheWebpackPlugin2 = _interopRequireDefault(_swPrecacheWebpackPlugin);

var _renderHtmlPlugin = require('./render-html-plugin');

var _renderHtmlPlugin2 = _interopRequireDefault(_renderHtmlPlugin);

var _pushManifest = require('./push-manifest');

var _pushManifest2 = _interopRequireDefault(_pushManifest);

var _webpackBaseConfig = require('./webpack-base-config');

var _webpackBaseConfig2 = _interopRequireDefault(_webpackBaseConfig);

var _util = require('../../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cleanFilename = name => name.replace(/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g, '');

function clientConfig(env) {
	const isProd = env.isProd,
	      source = env.source,
	      src = env.src;


	let entry = {
		bundle: (0, _path.resolve)(__dirname, './../entry'),
		polyfills: (0, _path.resolve)(__dirname, './polyfills')
	};

	if (!isProd) {
		entry.bundle = [entry.bundle, 'webpack-dev-server/client', 'webpack/hot/dev-server'];
	}

	return {
		entry: entry,
		output: {
			path: env.dest,
			publicPath: '/',
			filename: isProd ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js'
		},

		resolveLoader: {
			alias: {
				async: (0, _path.resolve)(__dirname, './async-component-loader')
			}
		},

		module: {
			loaders: [{
				test: /\.jsx?$/,
				include: [(0, _minimatch.filter)(source('routes') + '/{*.js,*/index.js}'), (0, _minimatch.filter)(source('components') + '/{routes,async}/{*.js,*/index.js}')],
				loader: (0, _path.resolve)(__dirname, './async-component-loader'),
				options: {
					name(filename) {
						filename = (0, _util.normalizePath)(filename);
						let relative = filename.replace((0, _util.normalizePath)(src), '');
						if (!relative.includes('/routes/')) return false;
						return 'route-' + cleanFilename(relative);
					},
					formatName(filename) {
						filename = (0, _util.normalizePath)(filename);
						let relative = filename.replace((0, _util.normalizePath)(source('.')), '');
						return cleanFilename(relative);
					}
				}
			}]
		},

		plugins: [...(0, _renderHtmlPlugin2.default)(env), new _pushManifest2.default(), new _copyWebpackPlugin2.default([...((0, _fs.existsSync)(source('manifest.json')) ? [{ from: 'manifest.json' }] : [{
			from: (0, _path.resolve)(__dirname, '../../resources/manifest.json'),
			to: 'manifest.json'
		}, {
			from: (0, _path.resolve)(__dirname, '../../resources/icon.png'),
			to: 'assets/icon.png'
		}]), (0, _fs.existsSync)(source('assets')) && { from: 'assets', to: 'assets' }].filter(Boolean))]
	};
}

function isProd(config) {
	let limit = 200 * 1000;

	const prodConfig = {
		performance: _extends({
			hints: 'warning',
			maxAssetSize: limit,
			maxEntrypointSize: limit
		}, config.pkg.performance),

		plugins: [new _webpack2.default.optimize.UglifyJsPlugin({
			output: { comments: false },
			mangle: true,
			sourceMap: true,
			compress: {
				properties: true,
				keep_fargs: false,
				pure_getters: true,
				collapse_vars: true,
				warnings: false,
				screw_ie8: true,
				sequences: true,
				dead_code: true,
				drop_debugger: true,
				comparisons: true,
				conditionals: true,
				evaluate: true,
				booleans: true,
				loops: true,
				unused: true,
				hoist_funs: true,
				if_return: true,
				join_vars: true,
				cascade: true,
				drop_console: false,
				pure_funcs: ['classCallCheck', '_classCallCheck', '_possibleConstructorReturn', 'Object.freeze', 'invariant', 'warning']
			}
		}), new _webpack2.default.DefinePlugin({
			'process.env.ADD_SW': config.serviceWorker
		})]
	};

	if (config.serviceWorker) {
		prodConfig.plugins.push(new _swPrecacheWebpackPlugin2.default({
			filename: 'sw.js',
			navigateFallback: 'index.html',
			navigateFallbackWhitelist: [/^(?!\/__).*/],
			minify: true,
			skipWaiting: false,
			stripPrefix: config.cwd,
			staticFileGlobsIgnorePatterns: [/polyfills(\..*)?\.js$/, /\.map$/, /push-manifest\.json$/, /.DS_Store/, /\.git/]
		}));
	}

	return prodConfig;
}

function isDev(config) {
	const cwd = config.cwd,
	      src = config.src;


	return {
		plugins: [new _webpack2.default.NamedModulesPlugin(), new _webpack2.default.HotModuleReplacementPlugin()],

		devServer: {
			inline: true,
			hot: true,
			compress: true,
			publicPath: '/',
			contentBase: src,
			https: config.https,
			port: process.env.PORT || config.port || 8080,
			host: process.env.HOST || config.host || '0.0.0.0',

			disableHostCheck: true,
			historyApiFallback: true,
			quiet: true,
			clientLogLevel: 'none',
			overlay: false,
			stats: 'minimal',
			watchOptions: {
				ignored: [(0, _path.resolve)(cwd, 'build'), (0, _path.resolve)(cwd, 'node_modules')]
			}
		}
	};
}