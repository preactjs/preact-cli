import rimraf from 'rimraf';
import { resolve } from 'path';
import { promisify } from 'bluebird';
import { isDir, error } from '../util';
import runWebpack, { showStats, writeJsonStats } from '../lib/webpack/run-webpack';

export default async function (src, argv) {
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

	let stats = await runWebpack(false, argv);

	showStats(stats);

	if (argv.json) {
		await writeJsonStats(stats);
	}
}
