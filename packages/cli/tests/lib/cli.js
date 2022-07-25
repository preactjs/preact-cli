const { join } = require('path');
const { mkdir } = require('fs').promises;
const { build: buildCmd, watch: watchCmd } = require('../../src/commands');
const {
	create: createCmd,
} = require('../../../create-cli/src/commands/create');
const { tmpDir } = require('./output');
const { linkPackage, handleOptimize } = require('./utils');

exports.create = async function (template, options) {
	let dest = await tmpDir();

	let opts = Object.assign({ name: `test-${template}`, cwd: '.' }, options);
	await createCmd(template, dest, opts);

	return dest;
};

const build = (exports.build = async function (cwd, options) {
	const argv = {
		src: 'src',
		dest: 'build',
		babelConfig: '.babelrc',
		config: 'preact.config.js',
		prerender: true,
		prerenderUrls: 'prerender-urls.json',
		'inline-css': true,
	};

	await mkdir(join(cwd, 'node_modules'), { recursive: true }); // ensure exists, avoid exit()
	await linkPackage('preact', cwd);
	await linkPackage('preact-render-to-string', cwd);

	let opts = Object.assign({ cwd }, argv, options);
	return await buildCmd(opts.src, opts);
});

exports.buildFast = async function (cwd, options) {
	await handleOptimize(cwd, options && options.config);
	return await build(cwd, options);
};

exports.watch = function (cwd, options) {
	const argv = {
		src: 'src',
		host: '127.0.0.1',
		https: false,
		config: 'preact.config.js',
		prerenderUrls: 'prerender-urls.json',
	};

	let opts = Object.assign({ cwd }, argv, options);
	return watchCmd(opts.src, opts);
};
