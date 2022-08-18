const webpack = require('webpack');
const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { merge } = require('webpack-merge');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CrittersPlugin = require('./critters-plugin.js');
const renderHTMLPlugin = require('./render-html-plugin');
const baseConfig = require('./webpack-base-config');
const { InjectManifest } = require('workbox-webpack-plugin');
const RefreshPlugin = require('@prefresh/webpack');
const { warn } = require('../../util');
const OptimizePlugin = require('optimize-plugin');

/**
 * @param {import('../../../types').Env} env
 * @returns {Promise<import('webpack').Configuration>}
 */
async function clientConfig(config, env) {
	const { source, src } = config;
	const { isProd } = env;

	let swInjectManifest = [];
	if (config.sw) {
		let swPath = join(__dirname, '..', '..', '..', 'sw', 'sw.js');
		const userSwPath = join(src, 'sw.js');
		if (existsSync(userSwPath)) {
			swPath = userSwPath;
		} else {
			warn(`Could not find sw.js in ${src}. Using the default service worker.`);
		}

		swInjectManifest.push(
			new InjectManifest({
				swSrc: swPath,
				include: [
					/200\.html$/,
					/(?<!legacy|polyfills)\.js$/,
					/\.css$/,
					/\.(png|jpg|svg|gif|webp|avif)$/,
				],
			})
		);
	}

	let copyPatterns = [
		existsSync(source('manifest.json')) && { from: 'manifest.json' },
		// copy any static files
		existsSync(source('assets')) && { from: 'assets', to: 'assets' },
		// copy sw-debug
		!isProd && {
			from: resolve(__dirname, '../../resources/sw-debug.js'),
			to: 'sw-debug.js',
		},
		// copy files from static to build directory
		existsSync(source('static')) && {
			from: resolve(source('static')),
			to: '.',
		},
	].filter(Boolean);

	return {
		entry: {
			bundle: resolve(__dirname, './../entry'),
			'dom-polyfills': resolve(__dirname, './polyfills'),
		},
		output: {
			path: config.dest,
			publicPath: '/',
			filename: isProd ? '[name].[chunkhash:5].js' : '[name].js',
			chunkFilename: isProd
				? '[name].chunk.[chunkhash:5].js'
				: '[name].chunk.js',
		},

		plugins: [
			new webpack.DefinePlugin({
				'process.env.ADD_SW': config.sw,
				'process.env.PRERENDER': config.prerender,
			}),
			...(await renderHTMLPlugin(config, env)),
			copyPatterns.length !== 0 &&
				new CopyWebpackPlugin({
					patterns: copyPatterns,
				}),
			...swInjectManifest,
		].filter(Boolean),
	};
}

/**
 * @returns {import('webpack').Configuration}
 */
function prodBuild(config) {
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
			new OptimizePlugin({
				polyfillsFilename: 'es-polyfills.js',
				exclude: [/^sw.*\.js/, /^dom-polyfills.*\.js/],
				modernize: false,
				verbose: false,
			}),
			new SizePlugin({
				stripHash: name =>
					name.replace(/\.[a-z0-9]{5}((\.legacy)?\.(?:js|css)$)/i, '.*****$1'),
			}),
		],
		cache: true,

		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
					test: /(sw|dom-polyfills).*\.js$/,
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
				}),
				new CssMinimizerPlugin(),
			],
		},
	};

	if (config.inlineCss) {
		prodConfig.plugins.push(
			new CrittersPlugin({
				preload: 'media',
				pruneSource: false,
				logLevel: 'silent',
				additionalStylesheets: ['routes-*.css'],
			})
		);
	}

	if (config.analyze) {
		prodConfig.plugins.push(new BundleAnalyzerPlugin());
	}

	return prodConfig;
}

function setupProxy(target) {
	if (!target) {
		return;
	}

	const errorTemplate = warn =>
		`Invalid proxy configuration in package.json. ${warn} Skipping and using default.`;

	if (typeof target !== 'string') {
		warn(errorTemplate('If provided, "proxy" must be a string.'));
		return;
	} else if (!/https?:\/\//.test(target)) {
		warn(
			errorTemplate(
				'If provided, "proxy" must start with "http://" or "https://".'
			)
		);
		return;
	}

	return {
		target,
		logLevel: 'warn',
		context: (pathname, req) => {
			return (
				req.method != 'GET' ||
				(!(/^\/?assets/.test(pathname) || pathname.startsWith('/ws')) &&
					req.headers.accept.indexOf('html') === -1)
			);
		},
		secure: false,
		changeOrigin: true,
		ws: true,
		xfwd: true,
	};
}

/**
 * @returns {import('webpack').Configuration}
 */
function devBuild(config) {
	const { cwd, src } = config;

	return {
		infrastructureLogging: {
			level: 'info',
		},
		plugins: [config.refresh && new RefreshPlugin()].filter(Boolean),

		optimization: {
			moduleIds: 'named',
		},

		devServer: {
			hot: config.refresh,
			liveReload: !config.refresh,
			compress: true,
			devMiddleware: {
				publicPath: '/',
				stats: 'errors-warnings',
			},
			static: {
				directory: src,
				watch: {
					ignored: [resolve(cwd, 'build'), resolve(cwd, 'node_modules')],
				},
			},
			https: config.https,
			port: config.port,
			host: config.host,
			allowedHosts: 'all',
			historyApiFallback: true,
			client: {
				logging: 'none',
				overlay: false,
			},
			proxy: setupProxy(config.pkg.proxy),
		},
	};
}

/**
 * @param {import('../../../types').Env} env
 */
module.exports = async function createClientConfig(config, env) {
	return merge(
		baseConfig(config, env),
		await clientConfig(config, env),
		(env.isProd ? prodBuild : devBuild)(config)
	);
};
