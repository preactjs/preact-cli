import { resolve } from 'path';
import { existsSync } from 'fs';
import HtmlWebpackExcludeAssetsPlugin from 'html-webpack-exclude-assets-plugin';
import ScriptExtHtmlWebpackPlugin from 'script-ext-html-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { readJson } from './webpack-base-config';
import prerender from './prerender';

export default function (config) {
	const { cwd, dest, isProd, src } = config;

	const htmlWebpackConfig = ({ url, title }) => ({
		filename: resolve(dest, url.substring(1), 'index.html'),
		template: `!!ejs-loader!${config.template || resolve(__dirname, '../../resources/template.html')}`,
		minify: isProd && {
			collapseWhitespace: true,
			removeScriptTypeAttributes: true,
			removeRedundantAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeComments: true
		},
		favicon: existsSync(resolve(src, 'assets/favicon.ico')) ? 'assets/favicon.ico' : resolve(__dirname, '../../resources/favicon.ico'),
		manifest: config.manifest,
		inject: true,
		compile: true,
		preload: config.preload===true,
		title: title || config.title || config.manifest.name || config.manifest.short_name || (config.pkg.name || '').replace(/^@[a-z]\//, '') || 'Preact App',
		excludeAssets: [/(bundle|polyfills)(\..*)?\.js$/],
		config,
		ssr(params) {
			return config.prerender ? prerender({ cwd, dest, src }, { ...params, url }) : '';
		}
	});

	const pages = readJson(resolve(cwd, config.prerenderUrls || '')) || [{ url: '/' }];

	return pages.map(htmlWebpackConfig).map(conf => new HtmlWebpackPlugin(conf)).concat([
		new HtmlWebpackExcludeAssetsPlugin(),
		new ScriptExtHtmlWebpackPlugin({
			// inline: 'bundle.js',
			defaultAttribute: 'defer'
		})
	]);
}
