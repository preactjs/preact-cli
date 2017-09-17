import { resolve } from 'path';
import { filter } from 'minimatch';
import {
	webpack,
	createConfig,
	customConfig,
	entryPoint,
	setOutput,
	addPlugins,
	performance,
	group
} from '@webpack-blocks/webpack2';
import devServer from '@webpack-blocks/dev-server2';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackExcludeAssetsPlugin from 'html-webpack-exclude-assets-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import PushManifestPlugin from './push-manifest';
import baseConfig, { exists, readJson } from './webpack-base-config';
import prerender from './prerender';

export default env => {
	const { isProd, source, src } = env;

	return createConfig.vanilla([
		baseConfig(env),
		entryPoint({
			'bundle': resolve(__dirname, './../entry'),
			'polyfills': resolve(__dirname, './polyfills'),
		}),
		setOutput({
			path: env.dest,
			publicPath: '/',
			filename: isProd ? "[name].[chunkhash:5].js" : "[name].js",
			chunkFilename: '[name].chunk.[chunkhash:5].js',
		}),

		// automatic async components :)
		customConfig({
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
								let relative = filename.replace(source('.'), '');
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
			}
		}),

		// monitor output size and warn if it exceeds 200kb:
		isProd && performance(Object.assign({
			maxAssetSize: 200 * 1000,
			maxEntrypointSize: 200 * 1000,
			hints: 'warning'
		}, env.pkg.performance || {})),
		// copy any static files
		addPlugins([
			new CopyWebpackPlugin([
				...(exists(source('manifest.json')) ? [
					{ from: 'manifest.json' }
				] : [
					{
						from: resolve(__dirname, '../../resources/manifest.json'),
						to: 'manifest.json'
					},
					{
						from: resolve(__dirname, '../../resources/icon.png'),
						to: 'assets/icon.png'
					}
				]),
				exists(source('assets')) && {
					from: 'assets',
					to: 'assets'
				}
			].filter(Boolean)),
			new PushManifestPlugin()
		]),

		htmlPlugin(env),

		isProd ? production(env) : development(env),

		customConfig({
			resolveLoader: {
				alias: {
					'async': resolve(__dirname, './async-component-loader')
				},
			}
		})
	].filter(Boolean));
};

const development = config => {
	const { cwd, src, https } = config;

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
			https: config.https,
			compress: true,
			publicPath: '/',
			contentBase: src
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
		}, [
			`webpack-dev-server/client?${origin}`,
			`webpack/hot/dev-server?${origin}`
		])
	]);
};

const production = config => addPlugins([
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
	})
]);

const htmlPlugin = (config) => {
	const { cwd, dest, isProd, src } = config;

	const htmlWebpackConfig = ({ url, title }) => ({
		filename: resolve(dest, url.substring(1), 'index.html'),
		template: `!!ejs-loader!${config.template || resolve(__dirname, '../../resources/template.html')}`,
		minify: config.production && {
			collapseWhitespace: true,
			removeScriptTypeAttributes: true,
			removeRedundantAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeComments: true
		},
		favicon: exists(resolve(src, 'assets/favicon.ico')) ? 'assets/favicon.ico' : resolve(__dirname, '../../resources/favicon.ico'),
		manifest: config.manifest,
		inject: true,
		compile: true,
		preload: config.preload===true,
		title: title || config.title || config.manifest.name || config.manifest.short_name || (config.pkg.name || '').replace(/^@[a-z]\//, '') || 'Preact App',
		excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
		config,
		ssr(params) {
			return config.prerender ? prerender({ cwd, dest, src }, { ...params, url }) : '';
		}
	});
	const pages = readJson(resolve(config.cwd, config.prerenderUrls || '')) || [{ url: "/" }];
	return addPlugins(pages
		.map(page => new HtmlWebpackPlugin(htmlWebpackConfig(page)))
		.concat([
			new HtmlWebpackExcludeAssetsPlugin(),
			new ScriptExtHtmlWebpackPlugin({
				// inline: 'bundle.js',
				defaultAttribute: 'defer'
			})
		]));
};
