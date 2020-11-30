const { isMainThread, parentPort, workerData } = require('worker_threads');
const { readFile } = require('../../fs');
const { join } = require('path');
const prerender = require('../webpack/prerender');
const ejs = require('ejs');
const { minify } = require('html-minifier');

async function render(src, dest, cwd, webpack, data) {
	const { url, title, ...routeData } = data;
	const templateSrc = await readFile(join(src, 'template.html'), 'utf-8');
	const manifest = await readFile(join(dest, 'manifest.json'), 'utf-8');
	const headEndTemplate = await readFile(
		join(__dirname, '..', '..', 'resources', 'head-end-modern.ejs'),
		'utf-8'
	);
	const bodyEndTemplate = await readFile(
		join(__dirname, '..', '..', 'resources', 'body-end-modern.ejs'),
		'utf-8'
	);
	const options = {
		url,
		manifest,
		ssr: () => {
			return prerender({ cwd, dest, src }, data);
		},
		CLI_DATA: { url, ...routeData },
		webpack,
	};
	const htmlWebpackPlugin = {
		options: {
			...options,
			title: title || manifest.name || manifest.short_name || 'Preact App',
		},
	};

	const headEnd = ejs.render(headEndTemplate, {
		options,
		htmlWebpackPlugin,
	});

	const bodyEnd = ejs.render(bodyEndTemplate, {
		options,
		htmlWebpackPlugin,
	});
	const template = templateSrc
		.replace(/<%\s+preact\.headEnd\s+%>/, headEnd)
		.replace(/<%\s+preact\.bodyEnd\s+%>/, bodyEnd);
	parentPort.postMessage({
		url,
		content: minify(
			ejs.render(template, {
				options,
				htmlWebpackPlugin,
			}),
			{
				collapseWhitespace: true,
			}
		),
	});
}

if (!isMainThread) {
	const { src, dest, cwd, webpack, data } = workerData;
	render(src, dest, cwd, webpack, data);
}
