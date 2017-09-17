import { resolve } from 'path';
import { readFileSync } from 'fs';
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
import WebpackChunkHash from 'webpack-chunk-hash';
import requireRelative from 'require-relative';
import createBabelConfig from '../babel-config';

export function readJson(file) {
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

export default env => {
	const { cwd, isProd, src, source } = env;

	env.dest = resolve(cwd, env.dest || 'build');
	env.manifest = readJson( source('manifest.json') ) || {};
	env.pkg = readJson( resolve(cwd, 'package.json') ) || {};

	let babelrc = readJson( resolve(cwd, '.babelrc') ) || {};
	let browsers = env.pkg.browserslist || ['> 1%', 'last 2 versions', 'IE >= 9'];

	return group([
		setContext(src),
		customConfig({
			resolve: {
				modules: [
					'node_modules',
					resolve(__dirname, '../../../node_modules')
				],
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less', '.scss', '.sass', '.styl', '.css'],
				alias: {
					'preact-cli-entrypoint': source('index.js'),
					style: source('style'),
					preact$: resolveDep(isProd ? 'preact/dist/preact.min.js' : 'preact', cwd),
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
				],
				alias: {
					'proxy-loader': require.resolve('./proxy-loader')
				}
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

		// LESS, SASS & CSS, STYLUS
		customConfig({
			module: {
				loaders: [
					{
						enforce: 'pre',
						test: /\.less$/,
						use: [
							{
								loader: 'proxy-loader',
								options: {
									cwd,
									loader: 'less-loader',
									options: {
										sourceMap: true
									}
								}
							}
						]
					},
					{
						enforce: 'pre',
						test: /\.s[ac]ss$/,
						use: [
							{
								loader: 'proxy-loader',
								options: {
									cwd,
									loader: 'sass-loader',
									options: { sourceMap: true }
								}
							}
						]
					},
					{
						enforce: 'pre',
						test: /\.styl$/,
						use: [
							{
								loader: 'proxy-loader',
								options: {
									cwd,
									loader: 'stylus-loader',
									options: { sourceMap: true }
								}
							}
						]
					},
					{
						test: /\.(css|less|s[ac]ss|styl)$/,
						include: [
							source('components'),
							source('routes')
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
						test: /\.(css|less|s[ac]ss|styl)$/,
						exclude: [
							source('components'),
							source('routes')
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
					context: src,
					postcss: () => [
						autoprefixer({ browsers })
					]
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
	new WebpackChunkHash(),
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
]);
