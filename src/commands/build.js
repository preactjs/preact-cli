import rimraf from 'rimraf';
import { resolve } from 'path';
import { promisify } from 'bluebird';
import { isDir, error } from '../util';
import runWebpack, { showStats, writeJsonStats } from '../lib/webpack/run-webpack';

export default async function (argv) {
	argv.src = argv._.pop() || argv.src;

	let cwd = resolve(argv.cwd);
	let modules = resolve(cwd, 'node_modules');

	if (!isDir(modules)) {
		return error('No `node_modules` found! Please run `npm install` before continuing.', 1);
	}

	if (argv.clean) {
		let dest = resolve(cwd, argv.dest);
		await Promise.promisify(rimraf)(dest);
	}

	let stats = await runWebpack(false, argv);

	showStats(stats);

	if (argv.json) {
		await writeJsonStats(stats);
	}
}
