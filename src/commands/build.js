import { resolve } from 'path';
import promisify from 'es6-promisify';
import rimraf from 'rimraf';
import asyncCommand from '../lib/async-command';
import webpackConfig from '../lib/webpack-config';
import runWebpack, { showStats } from '../lib/run-webpack';

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
		less: {
			description: 'Build and compile LESS files',
			alias: 'l',
			default: false
		},
		sass: {
			description: 'Build and compile SASS files',
			alias: 's',
			default: false
		},
		prerender: {
			description: 'Pre-render static app content.',
			default: true
		},
		clean: {
			description: 'Clear output directory before building.',
			default: true
		}
	},

	async handler(argv) {
		let config = webpackConfig(argv);

		if (argv.clean) {
			let dest = resolve(argv.cwd || process.cwd(), argv.dest || 'build');
			await promisify(rimraf)(dest);
		}

		let stats = await runWebpack(false, config);
		showStats(stats);
	}
});
