'use strict';

exports.__esModule = true;
exports.readJson = readJson;

exports.default = function (env) {
	const cwd = env.cwd,
	      isProd = env.isProd,
	      isWatch = env.isWatch,
	      src = env.src,
	      source = env.source;

	env.dest = (0, _path.resolve)(cwd, env.dest || 'build');
	env.manifest = readJson(source('manifest.json')) || {};
	env.pkg = readJson((0, _path.resolve)(cwd, 'package.json')) || {};

	let babelrc = readJson((0, _path.resolve)(cwd, '.babelrc')) || {};
	let browsers = env.pkg.browserslist || ['> 1%', 'last 2 versions', 'IE >= 9'];

	let nodeModules = (0, _path.resolve)(cwd, 'node_modules');

	return {
		context: src,

		resolve: {
			modules: ['node_modules', (0, _path.resolve)(__dirname, '../../../node_modules')],
			extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less', '.scss', '.sass', '.styl', '.css'],
			alias: {
				'style': source('style'),
				'preact-cli-entrypoint': source('index.js'),
				'preact$': resolveDep(isProd ? 'preact/dist/preact.min.js' : 'preact', cwd),

				'react': 'preact-compat',
				'react-dom': 'preact-compat',
				'create-react-class': 'preact-compat/lib/create-react-class',
				'react-addons-css-transition-group': 'preact-css-transition-group',
				'preact-cli/async-component': (0, _path.resolve)(__dirname, '../../components/async')
			}
		},

		resolveLoader: {
			modules: [(0, _path.resolve)(__dirname, '../../../node_modules'), nodeModules],
			alias: {
				'proxy-loader': require.resolve('./proxy-loader')
			}
		},

		module: {
			loaders: [{
				enforce: 'pre',
				test: /\.jsx?$/,
				loader: 'babel-loader',
				options: Object.assign((0, _babelConfig2.default)(env, { browsers }), babelrc)
			}, {
				enforce: 'pre',
				test: /\.less$/,
				use: [{
					loader: 'proxy-loader',
					options: {
						cwd,
						loader: 'less-loader',
						options: {
							sourceMap: true,
							paths: [nodeModules]
						}
					}
				}]
			}, {
				enforce: 'pre',
				test: /\.s[ac]ss$/,
				use: [{
					loader: 'proxy-loader',
					options: {
						cwd,
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							includePaths: [nodeModules]
						}
					}
				}]
			}, {
				enforce: 'pre',
				test: /\.styl$/,
				use: [{
					loader: 'proxy-loader',
					options: {
						cwd,
						loader: 'stylus-loader',
						options: {
							sourceMap: true,
							paths: [nodeModules]
						}
					}
				}]
			}, {
				test: /\.(css|less|s[ac]ss|styl)$/,
				include: [source('components'), source('routes')],
				loader: _extractTextWebpackPlugin2.default.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: {
							modules: true,
							localIdentName: '[local]__[hash:base64:5]',
							importLoaders: 1,
							sourceMap: isProd
						}
					}, {
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							sourceMap: true,
							plugins: [(0, _autoprefixer2.default)({ browsers })]
						}
					}]
				})
			}, {
				test: /\.(css|less|s[ac]ss|styl)$/,
				exclude: [source('components'), source('routes')],
				loader: _extractTextWebpackPlugin2.default.extract({
					fallback: 'style-loader',
					use: [{
						loader: 'css-loader',
						options: {
							sourceMap: isProd
						}
					}, {
						loader: 'postcss-loader',
						options: {
							ident: 'postcss',
							sourceMap: true,
							plugins: [(0, _autoprefixer2.default)({ browsers })]
						}
					}]
				})
			}, {
				test: /\.json$/,
				loader: 'json-loader'
			}, {
				test: /\.(xml|html|txt|md)$/,
				loader: 'raw-loader'
			}, {
				test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
				loader: isProd ? 'file-loader' : 'url-loader'
			}]
		},

		plugins: [new _webpack2.default.NoEmitOnErrorsPlugin(), new _webpack2.default.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
			'PRERENDER': env.ssr ? 'true' : 'false'
		}), new _extractTextWebpackPlugin2.default({
			filename: isProd ? 'style.[contenthash:5].css' : 'style.css',
			disable: isWatch,
			allChunks: true
		}), new _webpack2.default.optimize.CommonsChunkPlugin({
			children: true,
			async: false,
			minChunks: 3
		}), new _progressBarWebpackPlugin2.default({
			format: '\u001b[90m\u001b[44mBuild\u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
			renderThrottle: 100,
			summary: false,
			clear: true
		})].concat(isProd ? [new _webpack2.default.HashedModuleIdsPlugin(), new _webpack2.default.LoaderOptionsPlugin({ minimize: true }), new _webpack2.default.optimize.ModuleConcatenationPlugin(), new _webpackPluginReplace2.default({
			include: /babel-helper$/,
			patterns: [{
				regex: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
				value: s => `return;${Array(s.length - 7).join(' ')}(`
			}]
		})] : []),

		devtool: isWatch ? 'cheap-module-eval-source-map' : 'source-map',

		node: {
			console: false,
			process: false,
			Buffer: false,
			__filename: false,
			__dirname: false,
			setImmediate: false
		}
	};
};

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _path = require('path');

var _fs = require('fs');

var _autoprefixer = require('autoprefixer');

var _autoprefixer2 = _interopRequireDefault(_autoprefixer);

var _extractTextWebpackPlugin = require('extract-text-webpack-plugin');

var _extractTextWebpackPlugin2 = _interopRequireDefault(_extractTextWebpackPlugin);

var _progressBarWebpackPlugin = require('progress-bar-webpack-plugin');

var _progressBarWebpackPlugin2 = _interopRequireDefault(_progressBarWebpackPlugin);

var _webpackPluginReplace = require('webpack-plugin-replace');

var _webpackPluginReplace2 = _interopRequireDefault(_webpackPluginReplace);

var _requireRelative = require('require-relative');

var _requireRelative2 = _interopRequireDefault(_requireRelative);

var _babelConfig = require('../babel-config');

var _babelConfig2 = _interopRequireDefault(_babelConfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readJson(file) {
	if (file in readJson.cache) return readJson.cache[file];
	let ret;
	try {
		ret = JSON.parse((0, _fs.readFileSync)(file));
	} catch (e) {}
	return readJson.cache[file] = ret;
}
readJson.cache = {};

function resolveDep(dep, cwd) {
	try {
		return _requireRelative2.default.resolve(dep, cwd || process.cwd());
	} catch (e) {}
	try {
		return require.resolve(dep);
	} catch (e) {}
	return dep;
}