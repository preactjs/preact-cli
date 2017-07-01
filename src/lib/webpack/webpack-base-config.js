import { resolve } from 'path';
import { readFileSync, statSync } from 'fs';
import {
	webpack,
	group,
	customConfig,
	setContext,
	defineConstants,
	addPlugins,
	setDevTool
} from '@webpack-blocks/webpack2';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import ReplacePlugin from 'webpack-plugin-replace';
import requireRelative from 'require-relative';
import createBabelConfig from '../babel-config';

export function exists(file) {
	try {
		if (statSync(file)) return true;
	} catch (e) {}
	return false;
}

function readJson(file) {
	if (file in readJson.cache) return readJson.cache[file];
	let ret;
	try { ret = JSON.parse(readFileSync(file)); }
	catch (e) { }
	return readJson.cache[file] = ret;
}
readJson.cache = {};

// attempt to resolve a dependency, giving $CWD/node_modules priority:
function resolveDep(dep, cwd) {
	try { return requireRelative.resolve(dep, cwd || process.cwd()); } catch (e) {}
	try { return require.resolve(dep); } catch (e) {}
	return dep;
}

export default (env) => {
	let { isProd, cwd, src } = helpers(env);
	// only use src/ if it exists:
	if (!exists(src('.'))) {
		env.src = '.';
	}

	env.manifest = readJson(src('manifest.json')) || {};
	env.pkg = readJson(resolve(cwd, 'package.json')) || {};

	let babelrc = readJson(resolve(cwd, '.babelrc')) || {};
	let browsers = env.pkg.browserslist || ['> 1%', 'last 2 versions', 'IE >= 9'];

	return group([
		setContext(src('.')),
		customConfig({
			resolve: {
				modules: [
					'node_modules',
					resolve(__dirname, '../../../node_modules')
				],
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less', '.scss', '.sass', '.css'],
				alias: {
					'preact-cli-entrypoint': src('index.js'),
					style: src('style'),
					preact$: resolveDep(isProd ? 'preact/dist/preact.min.js' : 'preact', env.cwd),
					// preact-compat aliases for supporting React dependencies:
					react: 'preact-compat',
					'react-dom': 'preact-compat',
					'create-react-class': 'preact-compat/lib/create-react-class',
					'react-addons-css-transition-group': 'preact-css-transition-group',
					'preact-cli/async-component': resolve(__dirname, '../../components/async')
				}
			},
			resolveLoader: {
				modules: [
					resolve(__dirname, '../../../node_modules'),
					resolve(cwd, 'node_modules')
				]
			}
		}),

		// ES2015
		customConfig({
			module: {
				loaders: [
					{
						enforce: 'pre',
						test: /\.jsx?$/,
						loader: 'babel-loader',
						options: Object.assign(
							createBabelConfig(env, { browsers }),
							babelrc // intentionall overwrite our settings
						)
					}
				]
			}
		}),

		// LESS, SASS & CSS
		customConfig({
			module: {
				loaders: [
					{
						enforce: 'pre',
						test: /\.less$/,
						use: [
							{
								loader: resolve(__dirname, './npm-install-loader'),
								options: {
									modules: ['less', 'less-loader'],
									save: true
								}
							},
							{
								loader: 'less-loader',
								options: { sourceMap: true }
							}
						]
					},
					{
						enforce: 'pre',
						test: /\.s[ac]ss$/,
						use: [
							{
								loader: resolve(__dirname, './npm-install-loader'),
								options: {
									modules: ['node-sass', 'sass-loader'],
									save: true
								}
							},
							{
								loader: 'sass-loader',
								options: { sourceMap: true }
							}
						]
					},
					{
						test: /\.(css|less|s[ac]ss)$/,
						include: [
							src('components'),
							src('routes')
						],
						loader: ExtractTextPlugin.extract({
							fallback: 'style-loader',
							use: [
								`css-loader?modules&localIdentName=[local]__[hash:base64:5]&importLoaders=1&sourceMap=${isProd}`,
								`postcss-loader`
							]
						})
					},
					{
						test: /\.(css|less|s[ac]ss)$/,
						exclude: [
							src('components'),
							src('routes')
						],
						loader: ExtractTextPlugin.extract({
							fallback: 'style-loader',
							use: [
								`css-loader?sourceMap=${isProd}`,
								`postcss-loader`
							]
						})
					}
				]
			}
		}),

		// Arbitrary file loaders
		customConfig({
			module: {
				loaders: [
					{
						test: /\.json$/,
						loader: 'json-loader'
					},
					{
						test: /\.(xml|html|txt|md)$/,
						loader: 'raw-loader'
					},
					{
						test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
						loader: isProd ? 'file-loader' : 'url-loader'
					}
				]
			}
		}),

		addPlugins([
			new webpack.LoaderOptionsPlugin({
				options: {
					postcss: () => [
						autoprefixer({ browsers })
					],
					context: resolve(cwd, env.src || 'src')
				}
			}),
		]),

		defineConstants({
			'process.env.NODE_ENV': isProd ? 'production' : 'development'
		}),

		// Source maps for dev/prod:
		setDevTool(isProd ? 'source-map' : 'cheap-module-eval-source-map'),

		// remove unnecessary shims:
		customConfig({
			node: {
				console: false,
				process: false,
				Buffer: false,
				__filename: false,
				__dirname: false,
				setImmediate: false
			}
		}),

		// produce HTML & CSS:
		addPlugins([
			new ExtractTextPlugin({
				filename: isProd ? "style.[contenthash:5].css" : "style.css",
				disable: !isProd,
				allChunks: true
			})
		]),

		// Causes issues because it gets injected into the ServiceWorker
		// addPlugins([
		// 	new webpack.ProvidePlugin({
		// 		Promise: 'promise-polyfill',
		// 		fetch: 'isomorphic-unfetch'
		// 	})
		// ]),

		isProd ? production() : development(),

		addPlugins([
			new webpack.NoEmitOnErrorsPlugin(),

			new ProgressBarPlugin({
				format: '\u001b[90m\u001b[44mBuild\u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
				renderThrottle: 100,
				summary: false,
				clear: true
			}),

			new webpack.optimize.CommonsChunkPlugin({
				async: false,
				children: true,
				minChunks: 3
			})
		])
	].filter(Boolean));
};

const development = () =>	group([]);

const production = () => addPlugins([
	new webpack.HashedModuleIdsPlugin(),
	new webpack.LoaderOptionsPlugin({
		minimize: true
	}),

	// strip out babel-helper invariant checks
	new ReplacePlugin({
		include: /babel-helper$/,
		patterns: [{
			regex: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
			value: s => `return;${ Array(s.length-7).join(' ') }(`
		}]
	}),

	new webpack.optimize.UglifyJsPlugin({
		output: {
			comments: false
		},
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
			pure_funcs: [
				'classCallCheck',
				'_classCallCheck',
				'_possibleConstructorReturn',
				'Object.freeze',
				'invariant',
				'warning'
			]
		}
	}),
]);

export function helpers(env) {
	return {
		isProd:	env && env.production,
		cwd: env.cwd = resolve(env.cwd || process.cwd()),
		src: dir => resolve(env.cwd, env.src || 'src', dir)
	};
}
