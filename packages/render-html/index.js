const { resolve } = require('path');
const { existsSync } = require('fs');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createLoadManifest = require('@preact/cli-util/webpack/create-load-manifest');
const { warn, info } = require('@preact/cli-util');

const defaultConfig = {
	template: 'template.html', // Template path from src
	favicon: 'assets/favicon.ico', // Favicon path from src
	prerender: './prerender', // path to the prerender function
};

module.exports = (config = {}) =>
	async function(env) {
		const { template, favicon, prerender } = {
			...defaultConfig,
			...config,
		};
		const { cwd, dest, isProd, src } = env;
		let templatePath = [
			...(env.template ? [[env.template], [src, env.template]] : []),
			...(template ? [[template], [src, template]] : []),
			[src, 'template.html'],
		].find(xs => existsSync(resolve(...xs)));

		if (templatePath) {
			info(`Using custom template from ${resolve(...templatePath)}`);
		} else if (env.template || config.template) {
			warn(
				`Unable to find supplied template path ${env.template ||
					config.template}. Reverting to default template.`
			);
		}

		templatePath = resolve(
			...(templatePath ? templatePath : [__dirname, './resources/template.ejs'])
		);

		const htmlWebpackConfig = values => {
			const { url, title, ...routeData } = values;
			return Object.assign(values, {
				filename: resolve(dest, url.substring(1), 'index.html'),
				template: `!!ejs-loader!${templatePath}`,
				minify: isProd && {
					collapseWhitespace: true,
					removeScriptTypeAttributes: true,
					removeRedundantAttributes: true,
					removeStyleLinkTypeAttributes: true,
					removeComments: true,
				},
				favicon: existsSync(resolve(src, favicon))
					? resolve(src, favicon)
					: resolve(__dirname, './resources/favicon.ico'),
				inject: true,
				compile: true,
				inlineCss: env['inline-css'],
				preload: env.preload,
				manifest: env.manifest,
				title:
					title ||
					env.title ||
					env.manifest.name ||
					env.manifest.short_name ||
					(env.pkg.name || '').replace(/^@[a-z]\//, '') ||
					'Preact App',
				excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
				createLoadManifest: (assets, namedChunkGroups) => {
					if (assets['push-manifest.json']) {
						return JSON.parse(assets['push-manifest.json'].source());
					}
					return createLoadManifest(assets, env.esm, namedChunkGroups);
				},
				config: env,
				url,
				ssr() {
					return env.prerender
						? require(prerender)({ cwd, dest, src }, values)
						: '';
				},
				scriptLoading: 'defer',
				CLI_DATA: { preRenderData: { url, ...routeData } },
			});
		};

		let pages = [{ url: '/' }];

		if (env.prerenderUrls) {
			if (existsSync(resolve(cwd, env.prerenderUrls))) {
				try {
					let result = require(resolve(cwd, env.prerenderUrls));
					if (typeof result.default !== 'undefined') {
						result = result.default();
					}
					if (typeof result === 'function') {
						info(`Fetching URLs from ${env.prerenderUrls}`);
						result = await result();
						info(`Fetched URLs from ${env.prerenderUrls}`);
					}
					if (typeof result === 'string') {
						result = JSON.parse(result);
					}
					if (result instanceof Array) {
						pages = result;
					}
				} catch (error) {
					warn(
						`Failed to load prerenderUrls file, using default!\n${
							env.verbose ? error.stack : error.message
						}`
					);
				}
				// don't warn if the default file doesn't exist
			} else if (env.prerenderUrls !== 'prerender-urls.json' || env.verbose) {
				warn(
					`prerenderUrls file (${resolve(
						cwd,
						env.prerenderUrls
					)}) doesn't exist, using default!`
				);
			}
		}

		return pages
			.map(htmlWebpackConfig)
			.map(conf => new HtmlWebpackPlugin(conf))
			.concat([new HtmlWebpackExcludeAssetsPlugin()]);
	};
