const rimraf = require('rimraf');
const { resolve } = require('path');
const { promisify } = require('bluebird');
const { isDir, error } = require('../util');
const runWebpack = require('../lib/webpack/run-webpack');

const toBool = val => val === void 0 || (val === 'false' ? false : val);

module.exports = async function(src, argv) {
	argv.src = src || argv.src;
	// add `default:true`s, `--no-*` disables
	argv.prerender = toBool(argv.prerender);
	argv.production = toBool(argv.production);

	let cwd = resolve(argv.cwd);
	let modules = resolve(cwd, 'node_modules');

	if (!isDir(modules)) {
		return error(
			'No `node_modules` found! Please run `npm install` before continuing.',
			1
		);
	}

	if (argv.clean === void 0) {
		let dest = resolve(cwd, argv.dest);
		await promisify(rimraf)(dest);
	}

	let stats = await runWebpack(argv, false);

	if (argv.json) {
		await runWebpack.writeJsonStats(stats);
	}
};
