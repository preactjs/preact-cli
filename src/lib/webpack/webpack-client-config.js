import webpack from 'webpack';
import { resolve } from 'path';
import { existsSync } from 'fs';
import merge from 'webpack-merge';
import { filter } from 'minimatch';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import RenderHTMLPlugin from './render-html-plugin';
import PushManifestPlugin from './push-manifest';
import baseConfig from './webpack-base-config';

function clientConfig(env) {
	const { isProd, source, src } = env;

	return {
		entry: {
			bundle: resolve(__dirname, './../entry'),
			polyfills: resolve(__dirname, './polyfills')
		},

		output: {
			path: env.dest,
			publicPath: '/',
			filename: isProd ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js'
		},

		resolveLoader: {
			alias: {
				async: resolve(__dirname, './async-component-loader')
			}
		},

		// automatic async components :)
		module: {
			loaders: [
				{
					test: /\.jsx?$/,
					include: [
						filter(source('routes')+'/{*.js,*/index.js}'),
						filter(source('components')+'/{routes,async}/{*.js,*/index.js}')
					],
					loader: resolve(__dirname, './async-component-loader'),
					options: {
						name(filename) {
							let relative = filename.replace(src, '');
							let isRoute = filename.indexOf('/routes/') >= 0;

							return isRoute ? 'route-' + relative.replace(/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g, '') : false;
						},
						formatName(filename) {
							let relative = filename.replace(source('.'), '');
							// strip out context dir & any file/ext suffix
							return relative.replace(/(^\/(routes|components\/(routes|async))\/|(\/index)?\.js$)/g, '');
						}
					}
				}
			]
		},

		plugins: [
			...RenderHTMLPlugin(env),
			new PushManifestPlugin(),
			new CopyWebpackPlugin([
				...(
					existsSync(source('manifest.json'))
					? [{ from:'manifest.json' }]
					: [{
						from: resolve(__dirname, '../../resources/manifest.json'),
						to: 'manifest.json'
					}, {
						from: resolve(__dirname, '../../resources/icon.png'),
						to: 'assets/icon.png'
					}]
				),
				// copy any static files
				existsSync(source('assets')) && { from:'assets', to:'assets' }
			].filter(Boolean))
		]
	};
}

function isProd(config) {
	let limit = 200 * 1000; // 200kb

	return {
		performance: {
			hints: 'warning',
			maxAssetSize: limit,
			maxEntrypointSize: limit,
			...config.pkg.performance
		},

		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				output: { comments:false },
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
			new SWPrecacheWebpackPlugin({
				filename: 'sw.js',
				navigateFallback: 'index.html',
				navigateFallbackWhitelist: [/^(?!\/__).*/],
				minify: true,
				stripPrefix: config.cwd,
				staticFileGlobsIgnorePatterns: [
					/polyfills(\..*)?\.js$/,
					/\.map$/,
					/push-manifest\.json$/,
					/.DS_Store/
				]
			}),
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.serviceWorker
			}),
		]
	};
}

function isDev(config) {
	const { cwd, src } = config;

	return {
		plugins: [
			new webpack.NamedModulesPlugin(),
			new webpack.HotModuleReplacementPlugin()
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
				ignored: [
					resolve(cwd, 'build'),
					resolve(cwd, 'node_modules')
				]
			}
		}
	};
}

export default function (env) {
	return merge(
		baseConfig(env),
		clientConfig(env),
		(env.isProd ? isProd : isDev)(env)
	);
}
