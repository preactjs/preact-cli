const { readdir, rm } = require('fs/promises');
const { join, resolve } = require('path');
const runWebpack = require('../lib/webpack/run-webpack');
const { toBool } = require('../util');

exports.build = async function buildCommand(argv) {
	// add `default:true`s, `--no-*` disables
	argv.prerender = toBool(argv.prerender);

	let cwd = resolve(argv.cwd);

	// Empties destination directory -- useful when mounted with Docker
	// or similar situations where it's preferable to avoid directory deletion
	let dest = resolve(cwd, argv.dest);
	try {
		await Promise.all(
			(
				await readdir(dest)
			).map(item => rm(join(dest, item), { recursive: true }))
		);
	} catch (e) {
		if (e.code != 'ENOENT') throw e;
	}

	// we explicitly set the path as `dotenv` otherwise uses
	// `process.cwd()` -- this would cause issues in environments
	// like mono-repos or our test suite subjects where project root
	// and the current directory differ.
	require('dotenv').config({ path: resolve(cwd, '.env') });

	await runWebpack(argv, true);
};
