const rimraf = require('rimraf');
const { resolve } = require('path');
const { promisify } = require('bluebird');
const { isDir, error } = require('../util');
const runWebpack = require('../lib/webpack/run-webpack');
const { showStats, writeJsonStats } = runWebpack;

module.exports = async function (src, argv) {
	argv.src = src || argv.src;
	// add `default:true`s, `--no-*` disables
	argv.prerender = (argv.prerender === void 0);
	argv.production = (argv.production === void 0);

	let cwd = resolve(argv.cwd);
	let modules = resolve(cwd, 'node_modules');

	if (!isDir(modules)) {
		return error('No `node_modules` found! Please run `npm install` before continuing.', 1);
	}

	if (argv.clean === void 0) {
		let dest = resolve(cwd, argv.dest);
		await promisify(rimraf)(dest);
	}

	console.log('> i made it here');
	let stats = await runWebpack(false, argv);

	showStats(stats);

	if (argv.json) {
		await writeJsonStats(stats);
	}
}
