const mkdirp = require('mkdirp');
const { join, resolve } = require('path');
const cmd = require('../../src/commands');
const { tmpDir } = require('./output');
const { log } = require('./utils');

const argv = {
	_: [],
	src: 'src',
	dest: 'build',
	config: 'preact.config.js',
	prerenderUrls: 'prerender-urls.json',
};

exports.create = async function (template, name) {
	let dest = tmpDir();
	name = name || `test-${template}`;
	await cmd.create(template, dest, { name, cwd:'.' });
	return dest;
}

exports.build = function (cwd) {
	mkdirp.sync(join(cwd, 'node_modules')); // ensure exists, avoid exit()
	let opts = Object.assign({ cwd }, argv);
	return cmd.build(argv.src, opts);
}

exports.serve = function (cwd, port) {
	let opts = Object.assign({ cwd, port }, argv);
	return cmd.watch(argv.dest, opts);
}

exports.watch = function (cwd, host, port) {
	let opts = Object.assign({ cwd, host, port, https:false }, argv);
	return cmd.watch(argv.src, opts);
}
