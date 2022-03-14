const webpack = require('webpack');
const path = require('path');
const { resolve, dirname } = require('path');
const { readFileSync, existsSync } = require('fs');
const { isInstalledVersionPreactXOrAbove } = require('./utils');
const autoprefixer = require('autoprefixer');
const browserslist = require('browserslist');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ReplacePlugin = require('webpack-plugin-replace');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const createBabelConfig = require('../babel-config');
const loadPostcssConfig = require('postcss-load-config');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');

function readJson(file) {
	try {
		return JSON.parse(readFileSync(file, 'utf8'));
	} catch (e) {}
}

function findAllNodeModules(startDir) {
	let dir = path.resolve(startDir);
	let dirs = [];
	const { root } = path.parse(startDir);

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const joined = path.join(dir, 'node_modules');
		if (existsSync(joined)) {
			dirs.push(joined);
		}
		if (dir === root) {
			return dirs;
		}
		dir = path.dirname(dir);
	}
}

function resolveTsconfig(cwd, isProd) {
	if (existsSync(resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`))) {
		return resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`);
	} else if (existsSync(resolve(cwd, 'tsconfig.json'))) {
		return resolve(cwd, 'tsconfig.json');
	}
}

function getSassConfiguration(...includePaths) {
	const config = {
		sourceMap: true,
		sassOptions: {
			includePaths,
		},
	};

	Object.defineProperty(config, 'includePaths', { value: includePaths });

	return config;
}

/**
 * @returns {import('webpack').Configuration}
 */
module.exports = function createBaseConfig(env) {
	const { cwd, isProd, isWatch, src, source } = env;
	const babelConfigFile = env.babelConfig || '.babelrc';
	const IS_SOURCE_PREACT_X_OR_ABOVE = isInstalledVersionPreactXOrAbove(cwd);
	// Apply base-level `env` values
	env.dest = resolve(cwd, env.dest || 'build');
	env.manifest = readJson(source('manifest.json')) || {};
	env.pkg = readJson(resolve(cwd, 'package.json')) || {};

	let babelrc = readJson(resolve(cwd, babelConfigFile)) || {};

	// use browserslist config environment, config default, or default browsers
	// default browsers are > 0.25% global market share or Internet Explorer >= 9
	const browserslistDefaults = ['> 0.25%', 'IE >= 9'];
	const browserlistConfig = Object(browserslist.findConfig(cwd));
	const browsers =
		(isProd ? browserlistConfig.production : browserlistConfig.development) ||
		browserlistConfig.defaults ||
		browserslistDefaults;

	let userNodeModules = findAllNodeModules(cwd);
	let cliNodeModules = findAllNodeModules(__dirname);
	let nodeModules = [...new Set([...userNodeModules, ...cliNodeModules])];

	let compat = 'preact-compat';
	try {
		compat = dirname(
			require.resolve('preact/compat/package.json', { paths: [cwd] })
		);
	} catch (e) {
		try {
			compat = dirname(
				require.resolve('preact-compat/package.json', { paths: [cwd] })
			);
		} catch (e) {}
	}

	let tsconfig = resolveTsconfig(cwd, isProd);

	let postcssPlugins;

	try {
		postcssPlugins = loadPostcssConfig.sync(cwd).plugins;
	} catch (error) {
		postcssPlugins = [autoprefixer({ overrideBrowserslist: browsers })];
	}

	function tryResolveOptionalLoader(name) {
		try {
			return require.resolve(name);
		} catch (e) {
			return name;
		}
	}

	return {
		context: src,

		resolve: {
			modules: ['node_modules', ...nodeModules],
			extensions: [
				'.mjs',
				'.js',
				'.jsx',
				'.ts',
				'.tsx',
				'.json',
				'.less',
				'.pcss',
				'.scss',
				'.sass',
				'.styl',
				'.css',
				'.wasm',
			],
			alias: {
				style: source('style'),
				'preact-cli-entrypoint': source('index'),
				url: dirname(require.resolve('native-url/package.json')),
				// preact-compat aliases for supporting React dependencies:
				react: compat,
				'react-dom': compat,
				'preact-compat': compat,
				'react-addons-css-transition-group': 'preact-css-transition-group',
				'preact-cli/async-component': IS_SOURCE_PREACT_X_OR_ABOVE
					? require.resolve('@preact/async-loader/async')
					: require.resolve('@preact/async-loader/async-legacy'),
			},
			plugins: [
				// TODO: Remove when upgrading to webpack 5
				PnpWebpackPlugin,
			],
		},

		resolveLoader: {
			modules: [...nodeModules],
			alias: {
				'proxy-loader': require.resolve('./proxy-loader'),
			},
		},

		module: {
			rules: [
				{
					// ES2015
					enforce: 'pre',
					test: /\.m?[jt]sx?$/,
					resolve: { mainFields: ['module', 'jsnext:main', 'browser', 'main'] },
					type: 'javascript/auto',
					loader: require.resolve('babel-loader'),
					options: Object.assign(
						{ babelrc: false },
						createBabelConfig(env, { browsers }),
						babelrc // intentionally overwrite our settings
					),
				},
				{
					// LESS
					enforce: 'pre',
					test: /\.less$/,
					use: [
						{
							loader: require.resolve('./proxy-loader'),
							options: {
								cwd,
								loader: tryResolveOptionalLoader('less-loader'),
								options: {
									sourceMap: true,
									lessOptions: {
										paths: [...nodeModules],
									},
								},
							},
						},
					],
				},
				{
					// SASS
					enforce: 'pre',
					test: /\.s[ac]ss$/,
					use: [
						{
							loader: require.resolve('./proxy-loader'),
							options: {
								cwd,
								loader: tryResolveOptionalLoader('sass-loader'),
								options: getSassConfiguration(...nodeModules),
							},
						},
					],
				},
				{
					// STYLUS
					enforce: 'pre',
					test: /\.styl$/,
					use: [
						{
							loader: require.resolve('./proxy-loader'),
							options: {
								cwd,
								loader: tryResolveOptionalLoader('stylus-loader'),
								options: {
									sourceMap: true,
									paths: nodeModules,
								},
							},
						},
					],
				},
				{
					// User styles
					test: /\.(p?css|less|s[ac]ss|styl)$/,
					include: [source('components'), source('routes')],
					use: [
						isWatch
							? require.resolve('style-loader')
							: MiniCssExtractPlugin.loader,
						{
							loader: require.resolve('css-loader'),
							options: {
								modules: {
									localIdentName: '[local]__[hash:base64:5]',
								},
								importLoaders: 1,
								sourceMap: true,
							},
						},
						{
							loader: require.resolve('postcss-loader'),
							options: {
								sourceMap: true,
								postcssOptions: {
									plugins: postcssPlugins,
								},
							},
						},
					],
				},
				{
					// External / `node_module` styles
					test: /\.(p?css|less|s[ac]ss|styl)$/,
					exclude: [source('components'), source('routes')],
					use: [
						isWatch
							? require.resolve('style-loader')
							: MiniCssExtractPlugin.loader,
						{
							loader: require.resolve('css-loader'),
							options: {
								sourceMap: true,
							},
						},
						{
							loader: require.resolve('postcss-loader'),
							options: {
								sourceMap: true,
								postcssOptions: {
									plugins: postcssPlugins,
								},
							},
						},
					],
					// Don't consider CSS imports dead code even if the
					// containing package claims to have no side effects.
					// Remove this when webpack adds a warning or an error for this.
					// See https://github.com/webpack/webpack/issues/6571
					sideEffects: true,
				},
				{
					test: /\.(xml|html|txt|md)$/,
					loader: require.resolve('raw-loader'),
				},
				{
					test: /\.(svg|woff2?|ttf|eot|jpe?g|png|webp|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
					loader: isProd
						? require.resolve('file-loader')
						: require.resolve('url-loader'),
				},
			],
		},

		plugins: [
			new webpack.NoEmitOnErrorsPlugin(),
			new webpack.DefinePlugin(
				Object.keys(process.env)
					.filter(key => /^PREACT_APP_/.test(key))
					.reduce(
						(env, key) => {
							env[`process.env.${key}`] = JSON.stringify(process.env[key]);
							return env;
						},
						{
							'process.env.NODE_ENV': JSON.stringify(
								isProd ? 'production' : 'development'
							),
						}
					)
			),
			new webpack.ProvidePlugin({
				h: ['preact', 'h'],
				Fragment: ['preact', 'Fragment'],
			}),
			// Fix for https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
			new FixStyleOnlyEntriesPlugin(),
			// Extract CSS
			new MiniCssExtractPlugin({
				filename: isProd ? '[name].[contenthash:5].css' : '[name].css',
				chunkFilename: isProd
					? '[name].chunk.[contenthash:5].css'
					: '[name].chunk.css',
			}),
			ProgressBarPlugin({
				format:
					'\u001b[97m\u001b[44m Build \u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
				renderThrottle: 100,
				summary: false,
				clear: true,
			}),
			new WebpackManifestPlugin({
				fileName: 'asset-manifest.json',
				assetHookStage: webpack.Compiler.PROCESS_ASSETS_STAGE_ANALYSE,
				// TODO: Remove this next breaking change and use the full filepath from this manifest
				// when referring to built assets, i.e.:
				// https://github.com/preactjs/preact-cli/blob/master/packages/cli/lib/resources/head-end.ejs#L1
				// This is just to avoid any potentially breaking changes for right now.
				publicPath: '',
			}),
			...(tsconfig
				? [
						new ForkTsCheckerWebpackPlugin({
							checkSyntacticErrors: true,
							async: !isProd,
							tsconfig: tsconfig,
							silent: !isWatch,
						}),
				  ]
				: []),
			...(isProd
				? [
						new webpack.HashedModuleIdsPlugin(),
						new webpack.LoaderOptionsPlugin({ minimize: true }),
						new webpack.optimize.ModuleConcatenationPlugin(),

						// strip out babel-helper invariant checks
						new ReplacePlugin({
							include: /babel-helper$/,
							patterns: [
								{
									regex: /throw\s+(new\s+)?(Type|Reference)?Error\s*\(/g,
									value: s => `return;${Array(s.length - 7).join(' ')}(`,
								},
							],
						}),
				  ]
				: []),
		],

		optimization: {
			splitChunks: {
				minChunks: 3,
			},
		},

		mode: isProd ? 'production' : 'development',

		devtool: isWatch ? 'cheap-module-eval-source-map' : 'source-map',

		node: {
			console: false,
			process: false,
			Buffer: false,
			__filename: false,
			__dirname: false,
			setImmediate: false,
		},
	};
};
