const { join } = require('path');
const { existsSync, unlinkSync } = require('fs');
const cmd = require('../../lib/commands');
const { tmpDir } = require('./output');
const mkdirp = require('mkdirp');

const argv = {
	_: [],
	src: 'src',
	dest: 'build',
	config: 'preact.config.js',
	prerenderUrls: 'prerender-urls.json',
	'inline-css': true,
	preload: true,
};

exports.create = async function(template, name) {
	let dest = tmpDir();
	name = name || `test-${template}`;

	await cmd.create(template, dest, { name, cwd: '.' });

	// TODO: temporary – will resolve after 2.x->3.x release
	// Templates are using 2.x, which needs `.babelrc` for TEST modification.
	// The 3.x templates won't need `.babelrc` for { modules: commonjs }
	let babelrc = join(dest, '.babelrc');
	existsSync(babelrc) && unlinkSync(babelrc);

	return dest;
};

exports.build = function(cwd) {
	mkdirp.sync(join(cwd, 'node_modules')); // ensure exists, avoid exit()
	let opts = Object.assign({ cwd }, argv);
	return cmd.build(argv.src, opts);
};

exports.watch = function(cwd, port, host = '127.0.0.1') {
	let opts = Object.assign({ cwd, host, port, https: false }, argv);
	return cmd.watch(argv.src, opts);
};
