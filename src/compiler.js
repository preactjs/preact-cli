import { resolve } from 'path';
import promisify from 'es6-promisify';
import rimraf from 'rimraf';
import prerender from './lib/prerender';
import webpackConfig from './lib/webpack-config';
import runWebpack, { showStats, writeJsonStats } from './lib/run-webpack';

export default env => {
	let config = webpackConfig(env)

	return {
		async clean() {
			let dest = resolve(env.cwd || process.cwd(), env.dest || 'build');
			await promisify(rimraf)(dest);
		}

		async compile(watch = false) {
			let stats = await runWebpack(watch, config, showStats);
			showStats(stats);

			return stats;
	 	}

	 	prerender(params) {
			return prerender(env, params);
		}

		async writeJsonStats(stats) {
			await writeJsonStats(stats);
		}
	}
}
