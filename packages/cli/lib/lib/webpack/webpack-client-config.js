const webpack = require('webpack');
const { resolve } = require('path');
const { existsSync } = require('fs');
const merge = require('webpack-merge');
const { filter } = require('minimatch');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CrittersPlugin = require('critters-webpack-plugin');
const RenderHTMLPlugin = require('./render-html-plugin');
const PushManifestPlugin = require('./push-manifest');
const baseConfig = require('./webpack-base-config');
const BabelEsmPlugin = require('babel-esm-plugin');
const { normalizePath } = require('../../util');

const cleanFilename = name =>
	name.replace(
		/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g,
		''
	);

function clientConfig(env) {
	const { isProd, source, src /*, port? */ } = env;

	let entry = {
		bundle: resolve(__dirname, './../entry'),
		polyfills: resolve(__dirname, './polyfills'),
	};

	if (!isProd) {
		entry.bundle = [
			entry.bundle,
			'webpack-dev-server/client',
			'webpack/hot/dev-server',
		];
	}

	return {
		entry: entry,
		output: {
			path: env.dest,
			publicPath: '/',
			filename: isProd ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js',
		},

		resolveLoader: {
			alias: {
				async: require.resolve('@preact/async-loader'),
			},
		},

		// automatic async components :)
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					include: [
						filter(source('routes') + '/{*.js,*/index.js}'),
						filter(source('components') + '/{routes,async}/{*.js,*/index.js}'),
					],
					loader: require.resolve('@preact/async-loader'),
					options: {
						name(filename) {
							filename = normalizePath(filename);
							let relative = filename.replace(normalizePath(src), '');
							if (!relative.includes('/routes/')) return false;
							return 'route-' + cleanFilename(relative);
						},
						formatName(filename) {
							filename = normalizePath(filename);
							let relative = filename.replace(normalizePath(source('.')), '');
							return cleanFilename(relative);
						},
					},
				},
			],
		},

		plugins: [
			new PushManifestPlugin(env),
			...RenderHTMLPlugin(env),
			new CopyWebpackPlugin(
				[
					...(existsSync(source('manifest.json'))
						? [{ from: 'manifest.json' }]
						: [
								{
									from: resolve(__dirname, '../../resources/manifest.json'),
									to: 'manifest.json',
								},
								{
									from: resolve(__dirname, '../../resources/icon.png'),
									to: 'assets/icon.png',
								},
						  ]),
					// copy any static files
					existsSync(source('assets')) && { from: 'assets', to: 'assets' },
					// copy sw-debug
					{
						from: resolve(__dirname, '../../resources/sw-debug.js'),
						to: 'sw-debug.js',
					},
				].filter(Boolean)
			),
		],
	};
}

function isProd(config) {
	let limit = 200 * 1000; // 200kb

	const prodConfig = {
		performance: Object.assign(
			{
				hints: 'warning',
				maxAssetSize: limit,
				maxEntrypointSize: limit,
			},
			config.pkg.performance
		),

		plugins: [
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.sw,
				'process.env.ES_BUILD': false,
				'process.env.ESM': config.esm,
			}),
		],

		optimization: {
			minimizer: [
				new TerserPlugin({
					cache: true,
					parallel: true,
					terserOptions: {
						output: { comments: false },
						mangle: true,
						compress: {
							keep_fargs: false,
							pure_getters: true,
							hoist_funs: true,
							pure_funcs: [
								'classCallCheck',
								'_classCallCheck',
								'_possibleConstructorReturn',
								'Object.freeze',
								'invariant',
								'warning',
							],
						},
					},
					sourceMap: true,
				}),
				new OptimizeCssAssetsPlugin({}),
			],
		},
	};

	if (config.sw) {
		prodConfig.plugins.push(
			new SWPrecacheWebpackPlugin({
				filename: 'sw.js',
				navigateFallback: 'index.html',
				navigateFallbackWhitelist: [/^(?!\/__).*/],
				minify: true,
				stripPrefix: config.cwd,
				staticFileGlobsIgnorePatterns: [
					/\.esm\.js$/,
					/polyfills(\..*)?\.js$/,
					/\.map$/,
					/push-manifest\.json$/,
					/.DS_Store/,
					/\.git/,
				],
			})
		);
	}

	if (config.esm) {
		prodConfig.plugins.push(
			new BabelEsmPlugin({
				filename: '[name].[chunkhash:5].esm.js',
				chunkFilename: '[name].chunk.[chunkhash:5].esm.js',
				beforeStartExecution: (plugins, newConfig) => {
					const babelPlugins = newConfig.plugins;
					newConfig.plugins = babelPlugins.filter(plugin => {
						if (
							Array.isArray(plugin) &&
							plugin[0].indexOf('fast-async') !== -1
						) {
							return false;
						}
						return true;
					});
					plugins.forEach(plugin => {
						if (
							plugin.constructor.name === 'DefinePlugin' &&
							plugin.definitions
						) {
							for (const definition in plugin.definitions) {
								if (definition === 'process.env.ES_BUILD') {
									plugin.definitions[definition] = true;
								}
							}
						} else if (
							plugin.constructor.name === 'DefinePlugin' &&
							!plugin.definitions
						) {
							throw new Error(
								'WebpackDefinePlugin found but not `process.env.ES_BUILD`.'
							);
						}
					});
				},
			})
		);

		if (config.sw) {
			prodConfig.plugins.push(
				new SWPrecacheWebpackPlugin({
					filename: 'sw-esm.js',
					navigateFallback: 'index.html',
					navigateFallbackWhitelist: [/^(?!\/__).*/],
					minify: true,
					stripPrefix: config.cwd,
					staticFileGlobsIgnorePatterns: [
						/(\.[\w]{5}\.js)/,
						/polyfills(\..*)?\.js$/,
						/\.map$/,
						/push-manifest\.json$/,
						/.DS_Store/,
						/\.git/,
					],
				})
			);
		}
	}

	if (config['inline-css']) {
		prodConfig.plugins.push(
			new CrittersPlugin({
				preload: 'swap',
			})
		);
	}

	if (config.analyze) {
		prodConfig.plugins.push(new BundleAnalyzerPlugin());
	}

	return prodConfig;
}

function isDev(config) {
	const { cwd, src } = config;

	return {
		plugins: [
			new webpack.NamedModulesPlugin(),
			new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.sw,
			}),
		],

		devServer: {
			inline: true,
			hot: true,
			compress: true,
			publicPath: '/',
			contentBase: src,
			https: config.https,
			port: process.env.PORT || config.port || 8080,
			host: process.env.HOST || config.host || '0.0.0.0',
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
				ignored: [resolve(cwd, 'build'), resolve(cwd, 'node_modules')],
			},
		},
	};
}

module.exports = function(env) {
	return merge(
		baseConfig(env),
		clientConfig(env),
		(env.isProd ? isProd : isDev)(env)
	);
};
