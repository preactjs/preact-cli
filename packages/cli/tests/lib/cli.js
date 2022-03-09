const { join } = require('path');
const { mkdir, symlink } = require('fs').promises;
const cmd = require('../../lib/commands');
const { tmpDir } = require('./output');
const shell = require('shelljs');

const root = join(__dirname, '../../../..');

async function linkPackage(name, from, to) {
	try {
		await symlink(
			join(from, 'node_modules', name),
			join(to, 'node_modules', name)
		);
	} catch {}
}

const argv = {
	_: [],
	src: 'src',
	dest: 'build',
	config: 'preact.config.js',
	prerenderUrls: 'prerender-urls.json',
	'inline-css': true,
};

exports.create = async function (template, name) {
	let dest = await tmpDir();
	name = name || `test-${template}`;

	await cmd.create(template, dest, { name, cwd: '.' });

	return dest;
};

exports.build = async function (cwd, options, installNodeModules = false) {
	if (!installNodeModules) {
		await mkdir(join(cwd, 'node_modules'), { recursive: true }); // ensure exists, avoid exit()
		await linkPackage('preact', root, cwd);
		await linkPackage('preact-render-to-string', root, cwd);
	} else {
		shell.cd(cwd);
		shell.exec('npm i');
	}

	let opts = Object.assign({}, { cwd }, argv, options);
	return await cmd.build(opts.src, opts);
};

exports.watch = function (cwd, port, host = '127.0.0.1') {
	const args = { ...argv };
	delete args.dest;
	delete args['inline-css'];
	let opts = Object.assign({ cwd, host, port, https: false }, args);
	return cmd.watch(argv.src, opts);
};
