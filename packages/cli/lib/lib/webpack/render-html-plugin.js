const { resolve } = require('path');
const { existsSync } = require('fs');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { readJson } = require('./webpack-base-config');
const prerender = require('./prerender');
const createLoadManifest = require('./create-load-manifest');
const template = resolve(__dirname, '../../resources/template.html');

module.exports = function(config) {
	const { cwd, dest, isProd, src } = config;

	const htmlWebpackConfig = values => {
		let { url, title } = values;
		return Object.assign(values, {
			filename: resolve(dest, url.substring(1), 'index.html'),
			template: `!!ejs-loader!${config.template || template}`,
			minify: isProd && {
				collapseWhitespace: true,
				removeScriptTypeAttributes: true,
				removeRedundantAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeComments: true,
			},
			favicon: existsSync(resolve(src, 'assets/favicon.ico'))
				? 'assets/favicon.ico'
				: resolve(__dirname, '../../resources/favicon.ico'),
			inject: true,
			compile: true,
			inlineCss: config['inline-css'],
			preload: config.preload,
			manifest: config.manifest,
			title:
				title ||
				config.title ||
				config.manifest.name ||
				config.manifest.short_name ||
				(config.pkg.name || '').replace(/^@[a-z]\//, '') ||
				'Preact App',
			excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
			createLoadManifest: (assets, namedChunkGroups) => {
				if (assets['push-manifest.json']) {
					return JSON.parse(assets['push-manifest.json'].source());
				}
				return createLoadManifest(assets, config.esm, namedChunkGroups);
			},
			config,
			url,
			ssr(params) {
				Object.assign(params, { url });
				return config.prerender ? prerender({ cwd, dest, src }, params) : '';
			},
		});
	};

	const pages = readJson(resolve(cwd, config.prerenderUrls || '')) || [
		{ url: '/' },
	];

	return pages
		.map(htmlWebpackConfig)
		.map(conf => new HtmlWebpackPlugin(conf))
		.concat([
			new HtmlWebpackExcludeAssetsPlugin(),
			new ScriptExtHtmlWebpackPlugin({
				// inline: 'bundle.js',
				defaultAttribute: 'defer',
			}),
		]);
};
