const webpack = require('webpack');
const path = require('path');
const { resolve } = require('path');
const { readFileSync, existsSync } = require('fs');
const SizePlugin = require('size-plugin');
const autoprefixer = require('autoprefixer');
const requireRelative = require('require-relative');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const ReplacePlugin = require('webpack-plugin-replace');
const createBabelConfig = require('../babel-config');

function readJson(file) {
	try {
		return JSON.parse(readFileSync(file));
	} catch (e) {}
}

// attempt to resolve a dependency, giving $CWD/node_modules priority:
function resolveDep(dep, cwd) {
	try {
		return requireRelative.resolve(dep, cwd || process.cwd());
	} catch (e) {}
	try {
		return require.resolve(dep);
	} catch (e) {}
	return dep;
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

module.exports = function(env) {
	const { cwd, isProd, isWatch, src, source } = env;

	// Apply base-level `env` values
	env.dest = resolve(cwd, env.dest || 'build');
	env.manifest = readJson(source('manifest.json')) || {};
	env.pkg = readJson(resolve(cwd, 'package.json')) || {};

	let babelrc = readJson(resolve(cwd, 'old')) || {};
	let browsers = env.pkg.browserslist || ['> 0.25%', 'IE >= 9'];

	let userNodeModules = findAllNodeModules(cwd);
	let cliNodeModules = findAllNodeModules(__dirname);
	let nodeModules = [...new Set([...userNodeModules, ...cliNodeModules])];

	return {
		context: src,

		resolve: {
			modules: ['node_modules', ...nodeModules],
			extensions: [
				'.js',
				'.jsx',
				'.ts',
				'.tsx',
				'.json',
				'.less',
				'.scss',
				'.sass',
				'.styl',
				'.css',
			],
			alias: {
				style: source('style'),
				'preact-cli-entrypoint': source('index.js'),
				preact$: resolveDep(
					isProd ? 'preact/dist/preact.min.js' : 'preact',
					cwd
				),
				// preact-compat aliases for supporting React dependencies:
				react: 'preact-compat',
				'react-dom': 'preact-compat',
				'create-react-class': 'preact-compat/lib/create-react-class',
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
					// ES2015
					enforce: 'pre',
					test: /\.jsx?$/,
					loader: 'babel-loader',
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
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'less-loader',
								options: {
									sourceMap: true,
									paths: [nodeModules],
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
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'sass-loader',
								options: {
									sourceMap: true,
									includePaths: [nodeModules],
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
							loader: 'proxy-loader',
							options: {
								cwd,
								loader: 'stylus-loader',
								options: {
									sourceMap: true,
									paths: [nodeModules],
								},
							},
						},
					],
				},
				{
					// User styles
					test: /\.(css|less|s[ac]ss|styl)$/,
					include: [source('components'), source('routes')],
					use: [
						isWatch ? 'style-loader' : MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								modules: true,
								localIdentName: '[local]__[hash:base64:5]',
								importLoaders: 1,
								sourceMap: isProd,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								sourceMap: true,
								plugins: [autoprefixer({ browsers })],
							},
						},
					],
				},
				{
					// External / `node_module` styles
					test: /\.(css|less|s[ac]ss|styl)$/,
					exclude: [source('components'), source('routes')],
					use: [
						isWatch ? 'style-loader' : MiniCssExtractPlugin.loader,
						{
							loader: 'css-loader',
							options: {
								sourceMap: isProd,
							},
						},
						{
							loader: 'postcss-loader',
							options: {
								ident: 'postcss',
								sourceMap: true,
								plugins: [autoprefixer({ browsers })],
							},
						},
					],
				},
				{
					test: /\.(xml|html|txt|md)$/,
					loader: 'raw-loader',
				},
				{
					test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i,
					loader: isProd ? 'file-loader' : 'url-loader',
				},
			],
		},

		plugins: [
			new webpack.NoEmitOnErrorsPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(
					isProd ? 'production' : 'development'
				),
			}),
			new webpack.ProvidePlugin({
				h: ['preact', 'h'],
			}),
			// Extract CSS
			new MiniCssExtractPlugin({
				filename: isProd ? '[name].[contenthash:5].css' : '[name].css',
				chunkFilename: isProd
					? '[name].chunk.[contenthash:5].css'
					: '[name].chunk.css',
			}),
			new ProgressBarPlugin({
				format:
					'\u001b[90m\u001b[44mBuild\u001b[49m\u001b[39m [:bar] \u001b[32m\u001b[1m:percent\u001b[22m\u001b[39m (:elapseds) \u001b[2m:msg\u001b[22m',
				renderThrottle: 100,
				summary: false,
				clear: true,
			}),
			new SizePlugin(),
		].concat(
			isProd
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
				: []
		),

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

module.exports.readJson = readJson;
