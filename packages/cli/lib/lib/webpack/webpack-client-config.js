const webpack = require('webpack');
const { resolve, join } = require('path');
const { existsSync } = require('fs');
const { merge } = require('webpack-merge');
const { filter } = require('minimatch');
const SizePlugin = require('size-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CrittersPlugin = require('critters-webpack-plugin');
const renderHTMLPlugin = require('./render-html-plugin');
const baseConfig = require('./webpack-base-config');
const { InjectManifest } = require('workbox-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const RefreshPlugin = require('@prefresh/webpack');
const { normalizePath, warn } = require('../../util');
const OptimizePlugin = require('optimize-plugin');

const cleanFilename = name =>
	name.replace(
		/(^\/(routes|components\/(routes|async))\/|(\/index)?\.[jt]sx?$)/g,
		''
	);

/**
 * @returns {Promise<import('webpack').Configuration>}
 */
async function clientConfig(env) {
	const { source, src } = env;
	const asyncLoader = require.resolve('@preact/async-loader');

	let entry = {
		bundle: resolve(__dirname, './../entry'),
		'dom-polyfills': resolve(__dirname, './polyfills'),
	};

	let swInjectManifest = [];
	if (env.sw) {
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
					/(?<!legacy)\.js$/,
					/\.css$/,
					/\.(png|jpg|svg|gif|webp)$/,
				],
			})
		);
	}

	let copyPatterns = [
		existsSync(source('manifest.json')) && { from: 'manifest.json' },
		// copy any static files
		existsSync(source('assets')) && { from: 'assets', to: 'assets' },
		// copy sw-debug
		!env.isProd && {
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
		entry,
		output: {
			path: env.dest,
			publicPath: '/',
			filename: pathData => {
				if (pathData.chunk.name === 'dom-polyfills') {
					return env.isProd
						? '[name].[chunkhash:5].legacy.js'
						: '[name].legacy.js';
				}
				return env.isProd ? '[name].[chunkhash:5].js' : '[name].js';
			},
			chunkFilename: '[name].chunk.[chunkhash:5].js',
		},

		resolveLoader: {
			alias: {
				async: asyncLoader,
			},
		},

		// automatic async components :)
		module: {
			rules: [
				{
					test: /\.[jt]sx?$/,
					include: [
						filter(source('routes') + '/{*,*/index}.{js,jsx,ts,tsx}'),
						filter(
							source('components') +
								'/{routes,async}/{*,*/index}.{js,jsx,ts,tsx}'
						),
					],
					loader: asyncLoader,
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
			new webpack.DefinePlugin({
				'process.env.ADD_SW': env.sw,
				'process.env.PRERENDER': env.prerender,
			}),
			...(await renderHTMLPlugin(env)),
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
function isProd(env) {
	let limit = 200 * 1000; // 200kb
	const prodConfig = {
		performance: Object.assign(
			{
				hints: 'warning',
				maxAssetSize: limit,
				maxEntrypointSize: limit,
			},
			env.pkg.performance
		),

		plugins: [
			new OptimizePlugin({
				polyfillsFilename: 'es-polyfills.legacy.js',
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

	if (env['inline-css']) {
		prodConfig.plugins.push(
			new CrittersPlugin({
				preload: 'media',
				pruneSource: false,
				logLevel: 'silent',
				additionalStylesheets: ['route-*.css'],
			})
		);
	}

	if (env.analyze) {
		prodConfig.plugins.push(new BundleAnalyzerPlugin());
	}

	if (env.brotli) {
		prodConfig.plugins.push(
			new CompressionPlugin({
				filename: '[path].br[query]',
				algorithm: 'brotliCompress',
				test: /(?<!legacy)\.js$/,
			})
		);
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
function isDev(env) {
	const { cwd, src } = env;

	return {
		infrastructureLogging: {
			level: 'info',
		},
		plugins: [env.refresh && new RefreshPlugin()].filter(Boolean),

		optimization: {
			moduleIds: 'named',
		},

		devServer: {
			hot: env.refresh,
			liveReload: !env.refresh,
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
			https: env.https,
			port: env.port,
			host: process.env.HOST || env.host || '0.0.0.0',
			allowedHosts: 'all',
			historyApiFallback: true,
			client: {
				logging: 'none',
				overlay: false,
			},
			proxy: setupProxy(env.pkg.proxy),
		},
	};
}

module.exports = async function createClientConfig(env) {
	return merge(
		baseConfig(env),
		await clientConfig(env),
		(env.isProd ? isProd : isDev)(env)
	);
};
