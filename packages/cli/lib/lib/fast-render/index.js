const { info, warn } = require('../../util');
const { join, resolve } = require('path');
const { Worker } = require('worker_threads');
const { writeFile, mkdir } = require('../../fs');
const { PRERENDER_DATA_FILE_NAME } = require('../constants');
const pool = require('./pool');

module.exports = async function fastPrerender(
	{ src, dest, cwd, prerenderUrls },
	stats
) {
	let pages = [{ url: '/' }];
	if (prerenderUrls) {
		try {
			let result = require(resolve(cwd, prerenderUrls));
			if (typeof result.default !== 'undefined') {
				result = result.default();
			}
			if (typeof result === 'function') {
				result = await result();
			}
			if (typeof result === 'string') {
				result = JSON.parse(result);
			}
			if (result instanceof Array) {
				pages = result;
			}
		} catch (error) {
			warn('Failed to load prerenderUrls file, using default!\n');
		}
	}

	// eslint-disable-next-line no-console
	console.log('\n\n');
	info(
		`Prerendering ${pages.length} page${
			pages.length > 0 && 's'
		} from ${prerenderUrls}.`
	);
	const pageData = {};
	const renderedContents = await pool(
		pages.map(data => {
			pageData[data.url] = data;
			return {
				src,
				dest,
				cwd,
				webpack: {
					publicPath: stats.compilation.outputOptions.publicPath,
					assets: Object.keys(stats.compilation.assets),
				},
				data,
			};
		}),
		({ src, dest, cwd, webpack, data }) => {
			return new Promise(resolve => {
				const worker = new Worker(join(__dirname, 'renderer.js'), {
					workerData: {
						src,
						dest,
						cwd,
						webpack,
						data,
					},
				});
				worker.once('message', async preRenderContent => {
					worker.terminate();
					resolve(preRenderContent);
				});
			});
		}
	);
	renderedContents.forEach(async preRenderedContent => {
		const dirPath = preRenderedContent.url.endsWith('.html')
			? preRenderedContent.url.substring(
					0,
					preRenderedContent.url.lastIndexOf('/')
			  )
			: preRenderedContent.url;
		const filePath = preRenderedContent.url.endsWith('.html')
			? preRenderedContent.url
			: join(preRenderedContent.url, 'index.html');
		await mkdir(join(dest, dirPath), {
			recursive: true,
		});
		await writeFile(join(dest, filePath), preRenderedContent.content);
		await writeFile(
			join(dest, dirPath, PRERENDER_DATA_FILE_NAME),
			JSON.stringify(pageData[preRenderedContent.url])
		);
	});
};
