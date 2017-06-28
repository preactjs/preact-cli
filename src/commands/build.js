import { resolve } from 'path';
import promisify from 'es6-promisify';
import rimraf from 'rimraf';
import asyncCommand from '../lib/async-command';
import runWebpack, { showStats, writeJsonStats } from '../lib/webpack/run-webpack';

export default asyncCommand({
	command: 'build [src] [dest]',

	desc: 'Create a production build in build/',

	builder: {
		src: {
			description: 'Entry file (index.js)',
			default: 'src'
		},
		dest: {
			description: 'Directory root for output',
			default: 'build'
		},
		production: {
			description: 'Create a minified production build.',
			alias: 'p',
			default: true
		},
		prerender: {
			description: 'Pre-render static app content.',
			default: true
		},
		clean: {
			description: 'Clear output directory before building.',
			default: true
		},
		json: {
			description: 'Generate build statistics for analysis.',
			default: false
		},
		template: {
			description: 'HTML template used by webpack'
		}
	},

	async handler(argv) {
		if (argv.clean) {
			let dest = resolve(argv.cwd || process.cwd(), argv.dest || 'build');
			await promisify(rimraf)(dest);
		}

		let stats = await runWebpack(false, argv);
		showStats(stats);

		if (argv.json) {
			await writeJsonStats(stats);
		}
	}
});
