const rimraf = require('rimraf');
const { resolve } = require('path');
const { promisify } = require('util');
const runWebpack = require('../lib/webpack/run-webpack');
const { toBool } = require('../util');

exports.build = async function buildCommand(src, argv) {
	argv.src = src || argv.src;
	// add `default:true`s, `--no-*` disables
	argv.prerender = toBool(argv.prerender);
	argv.production = toBool(argv.production);

	let cwd = resolve(argv.cwd);

	// we explicitly set the path as `dotenv` otherwise uses
	// `process.cwd()` -- this would cause issues in environments
	// like mono-repos or our test suite subjects where project root
	// and the current directory differ.
	require('dotenv').config({ path: resolve(cwd, '.env') });

	if (argv.clean === void 0) {
		let dest = resolve(cwd, argv.dest);
		await promisify(rimraf)(dest);
	}

	let stats = await runWebpack(argv, false);

	if (argv.json) {
		await runWebpack.writeJsonStats(cwd, stats);
	}
};
