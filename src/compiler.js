import { resolve } from 'path';
import promisify from 'es6-promisify';
import rimraf from 'rimraf';
import prerender from './lib/prerender';
import webpackConfig from './lib/webpack-config';
import runWebpack, { showStats } from './lib/run-webpack';

class Compiler {
	constructor(env = {}) {
		this.env = env;
		this.config = webpackConfig(env);
		this.stats = null;
	}

	async clean() {
		let dest = resolve(this.env.cwd || process.cwd(), this.env.dest || 'build');
		await promisify(rimraf)(dest);
	}

	async compile(watch = false) {
		this.stats = await runWebpack(watch, this.config, showStats);
		showStats(this.stats);
	}

	prerender(params) {
		return prerender(this.env, params);
	}

	async stats() {
		await writeJsonStats(stats);
	}
}

export default env => {
	return new Compiler(env);
}
