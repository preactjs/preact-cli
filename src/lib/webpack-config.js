import { resolve } from 'path';
import { readFileSync, statSync } from 'fs';
import { filter } from 'minimatch';
import {
	webpack,
	group,
	createConfig,
	customConfig,
	setContext,
	entryPoint,
	setOutput,
	defineConstants,
	performance,
	addPlugins,
	setDevTool
} from '@webpack-blocks/webpack2';
import babel from '@webpack-blocks/babel6';
import devServer from '@webpack-blocks/dev-server2';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import autoprefixer from 'autoprefixer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import ProgressBarPlugin from 'progress-bar-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import ReplacePlugin from 'replace-bundle-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import createBabelConfig from './babel-config';
import prerender from './prerender';
import PushManifestPlugin from './push-manifest';

function exists(file) {
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

export default env => {
	let isProd = env && env.production;
	let cwd = env.cwd = resolve(env.cwd || process.cwd());
	let src = dir => resolve(env.cwd, env.src || 'src', dir);

	// only use src/ if it exists:
	if (!exists(src('.'))) {
		env.src = '.';
	}

	env.pkg = readJson(resolve(cwd, 'package.json')) || {};
	env.manifest = readJson(src('manifest.json')) || {};

	return createConfig.vanilla([
		setContext(src('.')),
		entryPoint(resolve(__dirname, './entry')),
		setOutput({
			path: resolve(cwd, env.dest || 'build'),
			publicPath: '/',
			filename: 'bundle.js',
			chunkFilename: '[name].chunk.[chunkhash:5].js'
		}),

		customConfig({
			resolve: {
				modules: [
					'node_modules',
					resolve(__dirname, '../../node_modules')
				],
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.json', '.less', '.scss', '.sass', '.css'],
				alias: {
					'preact-cli-entrypoint': src('index.js'),
					'preact-cli-polyfills': resolve(__dirname, 'polyfills.js'),
					style: src('style'),
					preact$: 'preact/dist/preact.min.js',
					// preact-compat aliases for supporting React dependencies:
					react: 'preact-compat',
					'react-dom': 'preact-compat',
					'react-addons-css-transition-group': 'preact-css-transition-group'
				}
			},
			resolveLoader: {
				alias: {
					'async': resolve(__dirname, './async-component-loader')
				},
				modules: [
					resolve(__dirname, '../../node_modules'),
					resolve(cwd, 'node_modules')
				]
			}
		}),

		// ES2015
		babel({
			include(filepath) {
				if (filepath.indexOf(src('.'))===0 || filepath.indexOf(resolve(__dirname, '../..'))===0 || filepath.split(/[/\\]/).indexOf('node_modules')===-1) return true;
				let manifest = resolve(filepath.replace(/(.*([\/\\]node_modules|\.\.)[\/\\](@[^\/\\]+[\/\\])?[^\/\\]+)([\/\\].*)?$/g, '$1'), 'package.json'),
					pkg = readJson(manifest) || {};
				return !!(pkg.module || pkg['jsnext:main']);
			},
			...createBabelConfig(env)
		}),

		// automatic async components :)
		customConfig({
			module: {
				loaders: [
					{
						test: /\.jsx?$/,
						include: [
							filter(src('routes')+'/{*.js,*/index.js}'),
							filter(src('components')+'/{routes,async}/{*.js,*/index.js}')
						],
						loader: resolve(__dirname, './async-component-loader'),
						options: {
							name(filename) {
								let relative = filename.replace(src('.'), '');
								let isRoute = filename.indexOf('/routes/') >= 0;

								return isRoute ? 'route-' + relative.replace(/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g, '') : false;
							},
							formatName(filename) {
								let relative = filename.replace(src('.'), '');
								// strip out context dir & any file/ext suffix
								return relative.replace(/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g, '');
							}
						}
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
						test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
						loader: isProd ? 'file-loader' : 'url-loader'
					}
				]
			}
		}),

		addPlugins([
			new webpack.LoaderOptionsPlugin({
				options: {
					postcss: () => [
						autoprefixer({
							browsers: ['last 2 versions']
						})
					],
					context: resolve(cwd, env.src || 'src')
				}
			}),
		]),

		defineConstants({
			'process.env.NODE_ENV': isProd ? 'production' : 'development'
		}),

		// monitor output size and warn if it exceeds 200kb:
		isProd && performance(Object.assign({
			maxAssetSize: 200 * 1000,
			maxEntrypointSize: 200 * 1000,
			hints: 'warning'
		}, env.pkg.performance || {})),

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

		// copy any static files
		addPlugins([
			new CopyWebpackPlugin([
				...(exists(src('manifest.json')) ? [
					{ from: 'manifest.json' }
				] : [
					{
						from: resolve(__dirname, '../resources/manifest.json'),
						to: 'manifest.json'
					},
					{
						from: resolve(__dirname, '../resources/icon.png'),
						to: 'assets/icon.png'
					}
				]),
				exists(src('assets')) && {
					from: 'assets',
					to: 'assets'
				}
			].filter(Boolean))
		]),

		// produce HTML & CSS:
		addPlugins([
			new ExtractTextPlugin({
				filename: 'style.css',
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

		htmlPlugin(env),

		isProd ? production(env) : development(env),

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
			}),

			new PushManifestPlugin()
		])
	].filter(Boolean));
};


const development = config => {
	let port = process.env.PORT || config.port || 8080,
		host = process.env.HOST || config.host || '0.0.0.0',
		origin = `${config.https===true?'https':'http'}://${host}:${port}/`;

	return group([
		addPlugins([
			new webpack.NamedModulesPlugin()
		]),

		devServer({
			port,
			host,
			inline: true,
			hot: true,
			https: config.https===true,
			compress: true,
			publicPath: '/',
			contentBase: resolve(config.cwd, config.src || './src'),
			// setup(app) {
			// 	app.use(middleware);
			// },
			disableHostCheck: true,
			historyApiFallback: true,
			quiet: true,
			clientLogLevel: 'none',
			overlay: false,
			stats: 'minimal',
			watchOptions: {
				ignored: [
					resolve(config.cwd, 'build'),
					resolve(config.cwd, 'node_modules')
				]
			}
		}, [
			`webpack-dev-server/client?${origin}`,
			`webpack/hot/dev-server?${origin}`
		])
	]);
};

const production = config => addPlugins([
	new webpack.HashedModuleIdsPlugin(),
	new webpack.LoaderOptionsPlugin({
		minimize: true
	}),

	// strip out babel-helper invariant checks
	new ReplacePlugin([{
		// this is actually the property name https://github.com/kimhou/replace-bundle-webpack-plugin/issues/1
		partten: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
		replacement: () => 'return;('
	}]),

	new webpack.optimize.UglifyJsPlugin({
		output: {
			comments: false
		},
		mangle: true,
		compress: {
			unsafe_comps: true,
			properties: true,
			keep_fargs: false,
			pure_getters: true,
			collapse_vars: true,
			unsafe: true,
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

	new SWPrecacheWebpackPlugin({
		filename: 'sw.js',
		navigateFallback: 'index.html',
		minify: true,
		stripPrefix: config.cwd,
		staticFileGlobsIgnorePatterns: [
			/\.map$/,
			/push-manifest\.json$/
		]
	})
]);


const htmlPlugin = config => addPlugins([
	new HtmlWebpackPlugin({
		filename: 'index.html',
		template: `!!ejs-loader!${config.template || resolve(__dirname, '../resources/template.html')}`,
		minify: config.production && {
			collapseWhitespace: true,
			removeScriptTypeAttributes: true,
			removeRedundantAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeComments: true
		},
		favicon: exists(resolve(config.cwd, 'assets/favicon.ico')) ? 'assets/favicon.ico' : resolve(__dirname, '../resources/favicon.ico'),
		manifest: config.manifest,
		inject: true,
		compile: true,
		preload: config.preload===true,
		title: config.title || config.manifest.name || config.manifest.short_name || (config.pkg.name || '').replace(/^@[a-z]\//, '') || 'Preact App',
		config,
		ssr(params) {
			return config.prerender ? prerender(config, params) : '';
		}
	}),

	new ScriptExtHtmlWebpackPlugin({
		// inline: 'bundle.js',
		defaultAttribute: 'async'
	})
]);
