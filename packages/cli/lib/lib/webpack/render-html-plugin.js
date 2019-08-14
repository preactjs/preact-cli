const { resolve, join } = require('path');
const os = require('os');
const { existsSync, readFileSync, writeFileSync, mkdtempSync } = require('fs');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prerender = require('./prerender');
const createLoadManifest = require('./create-load-manifest');
const { warn } = require('../../util');
const { info } = require('../../util');

let defaultTemplate = resolve(__dirname, '../../resources/template.html');

function read(path) {
	return readFileSync(resolve(__dirname, path), 'utf-8');
}

module.exports = async function(config) {
	const { cwd, dest, isProd, src } = config;
	const inProjectTemplatePath = resolve(src, 'template.html');
	let template = defaultTemplate;
	if (existsSync(inProjectTemplatePath)) {
		template = inProjectTemplatePath;
	}

	template = config.template || template;

	let content = read(template);
	if (/preact\.headEnd|preact\.bodyEnd/.test(content)) {
		const headEnd = read('../../resources/head-end.ejs');
		const bodyEnd = read('../../resources/body-end.ejs');
		content = content
			.replace(
				/<%\s+preact\.title\s+%>/,
				'<%= htmlWebpackPlugin.options.title %>'
			)
			.replace(/<%\s+preact\.headEnd\s+%>/, headEnd)
			.replace(/<%\s+preact\.bodyEnd\s+%>/, bodyEnd);

		// Unfortunately html-webpack-plugin expects a true file,
		// so we'll create a temporary one.
		const tmpDir = mkdtempSync(join(os.tmpdir(), 'preact-cli'));
		template = resolve(tmpDir, 'template.tmp.ejs');
		writeFileSync(template, content);
	}

	const htmlWebpackConfig = values => {
		const { url, title, ...routeData } = values;
		return Object.assign(values, {
			filename: resolve(dest, url.substring(1), 'index.html'),
			template: `!!ejs-loader!${template}`,
			minify: isProd && {
				collapseWhitespace: true,
				removeScriptTypeAttributes: true,
				removeRedundantAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeComments: true,
			},
			favicon: existsSync(resolve(src, 'assets/favicon.ico'))
				? 'assets/favicon.ico'
				: '',
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
			ssr() {
				return config.prerender ? prerender({ cwd, dest, src }, values) : '';
			},
			scriptLoading: 'defer',
			CLI_DATA: { preRenderData: { url, ...routeData } },
		});
	};

	let pages = [{ url: '/' }];

	if (config.prerenderUrls) {
		if (existsSync(resolve(cwd, config.prerenderUrls))) {
			try {
				let result = require(resolve(cwd, config.prerenderUrls));
				if (typeof result.default !== 'undefined') {
					result = result.default();
				}
				if (typeof result === 'function') {
					info(`Fetching URLs from ${config.prerenderUrls}`);
					result = await result();
					info(`Fetched URLs from ${config.prerenderUrls}`);
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
						config.verbose ? error.stack : error.message
					}`
				);
			}
			// don't warn if the default file doesn't exist
		} else if (
			config.prerenderUrls !== 'prerender-urls.json' ||
			config.verbose
		) {
			warn(
				`prerenderUrls file (${resolve(
					cwd,
					config.prerenderUrls
				)}) doesn't exist, using default!`
			);
		}
	}

	return pages
		.map(htmlWebpackConfig)
		.map(conf => new HtmlWebpackPlugin(conf))
		.concat([new HtmlWebpackExcludeAssetsPlugin()]);
};
