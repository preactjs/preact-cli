const webpack = require('webpack');
const path = require('path');
const { readFileSync, existsSync } = require('fs');
const autoprefixer = require('autoprefixer');
const browserslist = require('browserslist');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const createBabelConfig = require('../babel-config');
const loadPostcssConfig = require('postcss-load-config');

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
	if (
		existsSync(path.resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`))
	) {
		return path.resolve(cwd, `tsconfig.${isProd ? 'prod' : 'dev'}.json`);
	} else if (existsSync(path.resolve(cwd, 'tsconfig.json'))) {
		return path.resolve(cwd, 'tsconfig.json');
	}
}

/**
 * @param {import('../../../types').Env} env
 * @returns {import('webpack').Configuration}
 */
module.exports = function createBaseConfig(config, env) {
	const { cwd, src, source } = config;
	const { isProd, isServer } = env;

	// Apply base-level `config` values
	config.dest = path.resolve(cwd, config.dest || 'build');
	config.manifest = readJson(source('manifest.json')) || {};
	config.pkg = readJson(path.resolve(cwd, 'package.json')) || {};

	// use browserslist config environment, config default, or default browsers
	// default browsers are '> 0.5%, last 2 versions, Firefox ESR, not dead'
	const browserlistConfig = Object(browserslist.findConfig(cwd));
	const browsers =
		(isProd ? browserlistConfig.production : browserlistConfig.development) ||
		browserlistConfig.defaults ||
		'defaults';

	let userNodeModules = findAllNodeModules(cwd);
	let cliNodeModules = findAllNodeModules(__dirname);
	let nodeModules = [...new Set([...userNodeModules, ...cliNodeModules])];

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
				'react/jsx-runtime': require.resolve('preact/jsx-runtime'),
				react: require.resolve('preact/compat'),
				'react-dom/test-utils': require.resolve('preact/test-utils'),
				'react-dom': require.resolve('preact/compat'),
				'react-addons-css-transition-group': 'preact-css-transition-group',
				'preact-cli/async-component': require.resolve(
					'@preact/async-loader/async'
				),
			},
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
					enforce: 'pre',
					test: /\.m?[jt]sx?$/,
					type: 'javascript/auto',
					use: [
						{
							loader: require.resolve('babel-loader'),
							options: createBabelConfig(config, isProd),
						},
						require.resolve('source-map-loader'),
					],
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
								options: {
									sourceMap: true,
									sassOptions: {
										includePaths: [...nodeModules],
									},
								},
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
					test: /\.(p?css|less|s[ac]ss|styl)$/,
					exclude: /\.module\.(p?css|less|s[ac]ss|styl)$/,
					use: [
						isProd
							? MiniCssExtractPlugin.loader
							: require.resolve('style-loader'),
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
					test: /\.module\.(p?css|less|s[ac]ss|styl)$/,
					use: [
						isProd
							? MiniCssExtractPlugin.loader
							: require.resolve('style-loader'),
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
					test: /\.(xml|html|txt|md)$/,
					type: 'asset/source',
				},
				{
					test: /\.(svg|woff2?|ttf|eot|jpe?g|png|webp|avif|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
					type: isProd ? 'asset/resource' : 'asset/inline',
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
			// Fix for https://github.com/webpack-contrib/mini-css-extract-plugin/issues/151
			new RemoveEmptyScriptsPlugin(),
			new MiniCssExtractPlugin({
				filename:
					isProd && !isServer ? '[name].[contenthash:5].css' : '[name].css',
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
			tsconfig &&
				new ForkTsCheckerWebpackPlugin({
					typescript: {
						configFile: tsconfig,
						diagnosticOptions: {
							syntactic: true,
						},
					},
				}),
			new webpack.optimize.ModuleConcatenationPlugin(),
		].filter(Boolean),

		optimization: {
			...(isProd && { moduleIds: 'deterministic' }),
			splitChunks: {
				minChunks: 3,
			},
		},

		mode: isProd ? 'production' : 'development',

		devtool: isProd ? 'source-map' : 'eval-cheap-module-source-map',

		node: {
			__filename: false,
			__dirname: false,
		},
	};
};
