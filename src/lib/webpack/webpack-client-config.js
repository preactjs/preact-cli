import { resolve } from 'path';
import {
	webpack,
	createConfig,
	entryPoint,
	setOutput,
	addPlugins,
	performance,
	group
} from '@webpack-blocks/webpack2';
import devServer from '@webpack-blocks/dev-server2';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import SWPrecacheWebpackPlugin from 'sw-precache-webpack-plugin';
import PushManifestPlugin from './push-manifest';
import baseConfig, { exists, helpers } from './webpack-base-config';
import prerender from './prerender';

export default env => {
	let { isProd, cwd, src } = helpers(env);
	return createConfig.vanilla([
		baseConfig(env),
		entryPoint(resolve(__dirname, '../entry')),
		setOutput({
			path: resolve(cwd, env.dest || 'build'),
			publicPath: '/',
			filename: 'bundle.js',
			chunkFilename: '[name].chunk.[chunkhash:5].js'
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
				...(exists(src('manifest.json')) ? [
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
				exists(src('assets')) && {
					from: 'assets',
					to: 'assets'
				}
			].filter(Boolean)),
			new PushManifestPlugin()
		]),

		htmlPlugin(env),

		isProd ? production(env) : development(env)
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
		template: `!!ejs-loader!${config.template || resolve(__dirname, '../../resources/template.html')}`,
		minify: config.production && {
			collapseWhitespace: true,
			removeScriptTypeAttributes: true,
			removeRedundantAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeComments: true
		},
		favicon: exists(resolve(config.cwd, 'assets/favicon.ico')) ? 'assets/favicon.ico' : resolve(__dirname, '../../resources/favicon.ico'),
		manifest: config.manifest,
		inject: true,
		compile: true,
		preload: config.preload===true,
		title: config.title || config.manifest.name || config.manifest.short_name || (config.pkg.name || '').replace(/^@[a-z]\//, '') || 'Preact App',
		config,
		ssr(params) {
			return config.prerender ? prerender(params) : '';
		}
	}),

	new ScriptExtHtmlWebpackPlugin({
		// inline: 'bundle.js',
		defaultAttribute: 'async'
	})
]);

