const { mkdtemp, readFile, writeFile } = require('fs/promises');
const { existsSync } = require('fs');
const { resolve, join } = require('path');
const os = require('os');
const { Compilation, sources } = require('webpack');
const {
	HtmlWebpackSkipAssetsPlugin,
} = require('html-webpack-skip-assets-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const prerender = require('./prerender');
const { esmImport, error, tryResolveConfig, warn } = require('../../util');

const PREACT_FALLBACK_URL = '/200.html';

/**
 * @param {import('../../../types').Env} env
 */
module.exports = async function renderHTMLPlugin(config, env) {
	const { cwd, dest, src } = config;

	let templatePath;
	if (config.template) {
		templatePath = tryResolveConfig(
			cwd,
			config.template,
			false,
			config.verbose
		);
	}

	if (!templatePath) {
		templatePath = tryResolveConfig(
			cwd,
			resolve(src, 'template.ejs'),
			true,
			config.verbose
		);

		// Additionally checks for <src-dir>/template.html for
		// back-compat with v3
		if (!templatePath) {
			templatePath = tryResolveConfig(
				cwd,
				resolve(src, 'template.html'),
				true,
				config.verbose
			);
		}

		if (!templatePath)
			templatePath = resolve(__dirname, '../../resources/template.ejs');
	}

	let templateContent = await readFile(templatePath, 'utf-8');
	if (/preact\.(?:headEnd|bodyEnd)/.test(templateContent)) {
		const message = `
			'<% preact.headEnd %>' and '<% preact.bodyEnd %>' are no longer supported in CLI v4!
			You can copy the new default 'template.ejs' from the following link or adapt your existing:

			https://github.com/preactjs/preact-cli/blob/master/packages/cli/src/resources/template.ejs
		`;

		error(message.trim().replace(/^\t+/gm, '') + '\n');
	}
	if (/preact\.title/.test(templateContent)) {
		templateContent = templateContent.replace(
			/<%[=]?\s+preact\.title\s+%>/,
			'<%= cli.title %>'
		);

		// Unfortunately html-webpack-plugin expects a true file,
		// so we'll create a temporary one.
		const tmpDir = await mkdtemp(join(os.tmpdir(), 'preact-cli-'));
		templatePath = resolve(tmpDir, 'template.tmp.ejs');
		await writeFile(templatePath, templateContent);
	}

	const htmlWebpackConfig = values => {
		let { url, title, ...routeData } = values;

		title =
			title ||
			config.title ||
			config.manifest.name ||
			config.manifest.short_name ||
			(config.pkg.name || '').replace(/^@[a-z]\//, '') ||
			'Preact App';

		// Do not create a folder if the url is for a specific file.
		const filename = url.endsWith('.html')
			? resolve(dest, url.substring(1))
			: resolve(dest, url.substring(1), 'index.html');

		return {
			title,
			filename,
			template: `!!${require.resolve(
				'ejs-loader'
			)}?esModule=false!${templatePath}`,
			templateParameters: async (compilation, assets, assetTags, options) => {
				let entrypoints = {};
				compilation.entrypoints.forEach((entrypoint, name) => {
					let entryFiles = entrypoint.getFiles();

					entrypoints[name] =
						assets.publicPath +
						entryFiles.find(file => /\.m?js(?:\?|$)/.test(file));
				});

				const compilationAssets = Object.keys(compilation.assets);
				const outputName = entrypoints['bundle']
					.match(/^([^.]*)/)[1]
					.replace(assets.publicPath, '');
				const rgx = new RegExp(`${outputName}.*legacy.js$`);
				const legacyOutput = compilationAssets.find(file => rgx.test(file));
				if (legacyOutput) {
					entrypoints['legacy-bundle'] = assets.publicPath + legacyOutput;
				}

				if (compilationAssets.includes('es-polyfills.js')) {
					entrypoints['es-polyfills'] = assets.publicPath + 'es-polyfills.js';
				}

				return {
					cli: {
						title,
						url,
						manifest: config.manifest,
						// pkg isn't likely to be useful and manifest is already made available
						config: (({ pkg: _pkg, manifest: _manifest, ...rest }) => rest)(
							config
						),
						env,
						preRenderData: values,
						CLI_DATA: { preRenderData: { url, ...routeData } },
						ssr: config.prerender ? await prerender(config, values) : '',
						entrypoints,
					},
					htmlWebpackPlugin: {
						tags: assetTags,
						files: assets,
						options,
					},
				};
			},
			inject: true,
			favicon: existsSync(resolve(src, 'assets/favicon.ico'))
				? 'assets/favicon.ico'
				: '',
			manifest: existsSync(resolve(src, 'manifest.json'))
				? 'manifest.json'
				: '',
			excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
		};
	};

	let pages = [{ url: '/' }];

	if (config.prerenderUrls) {
		const prerenderUrls = tryResolveConfig(
			cwd,
			config.prerenderUrls,
			config.prerenderUrls === 'prerender-urls.json',
			config.verbose
		);

		if (prerenderUrls) {
			try {
				let result = esmImport(prerenderUrls);

				if (typeof result.default !== 'undefined') {
					result = result.default;
				}
				if (typeof result === 'function') {
					result = await result();
				}
				if (typeof result === 'string') {
					result = JSON.parse(result);
				}
				if (Array.isArray(result)) {
					pages = result;
				}
			} catch (error) {
				warn(
					`Failed to load prerenderUrls file, using default!\n${
						config.verbose ? error.stack : error.message
					}`
				);
			}
		}
	}
	/**
	 * We cache a non SSRed page in service worker so that there is
	 * no flash of content when user lands on routes other than `/`.
	 * And we dont have to cache every single html file.
	 * Go easy on network usage of clients.
	 */
	!pages.find(page => page.url === PREACT_FALLBACK_URL) &&
		config.sw &&
		pages.push({ url: PREACT_FALLBACK_URL });

	const resultPages = pages
		.map(htmlWebpackConfig)
		.map(conf => new HtmlWebpackPlugin(conf))
		.concat([new HtmlWebpackSkipAssetsPlugin()]);

	return config.prerender
		? resultPages.concat([
				...pages.map(page => new PrerenderDataExtractPlugin(page)),
		  ])
		: resultPages;
};

// Adds a preact_prerender_data in every folder so that the data could be fetched separately.
class PrerenderDataExtractPlugin {
	constructor(page) {
		const url = page.url;
		this.location_ = url.endsWith('/') ? url : url + '/';
		this.data_ = JSON.stringify(page || {});
	}
	apply(compiler) {
		compiler.hooks.thisCompilation.tap(
			'PrerenderDataExtractPlugin',
			compilation => {
				compilation.hooks.processAssets.tap(
					{
						name: 'PrerenderDataExtractPlugin',
						stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
					},
					() => {
						if (this.location_ === `${PREACT_FALLBACK_URL}/`) {
							// We dont build prerender data for `200.html`. It can re-use the one for homepage.
							return;
						}
						let path = this.location_ + 'preact_prerender_data.json';
						if (path.startsWith('/')) {
							path = path.substring(1);
						}
						compilation.emitAsset(path, new sources.RawSource(this.data_));
					}
				);
			}
		);
	}
}
