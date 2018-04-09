const mkdirp = require('mkdirp');
const { join } = require('path');
const cmd = require('../../src/commands');
const { tmpDir } = require('./output');

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
};

exports.build = function (cwd) {
	mkdirp.sync(join(cwd, 'node_modules')); // ensure exists, avoid exit()
	let opts = Object.assign({ cwd }, argv);
	return cmd.build(argv.src, opts);
};

exports.watch = function (cwd, port, host='127.0.0.1') {
	let opts = Object.assign({ cwd, host, port, https:false }, argv);
	return cmd.watch(argv.src, opts);
};
