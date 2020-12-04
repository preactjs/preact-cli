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

		// eslint-disable-next-line no-console
		console.log('\n\n');
		info(
			`Prerendering ${result.length} page${
				result.length > 0 && 's'
			} from ${prerenderUrls}.`
		);
		const pageData = {};
		const renderedContents = await pool(
			result.map(data => {
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
					worker.once('message', async result => {
						worker.terminate();
						resolve(result);
					});
				});
			}
		);
		renderedContents.forEach(async result => {
			const dirPath = result.url.endsWith('.html')
				? result.url.substring(0, result.url.lastIndexOf('/'))
				: result.url;
			const filePath = result.url.endsWith('.html')
				? result.url
				: join(result.url, 'index.html');
			await mkdir(join(dest, dirPath), {
				recursive: true,
			});
			await writeFile(join(dest, filePath), result.content);
			await writeFile(
				join(dest, dirPath, PRERENDER_DATA_FILE_NAME),
				JSON.stringify(pageData[result.url])
			);
		});
	} catch (error) {
		warn('Failed to load prerenderUrls file, using default!\n');
	}
};
