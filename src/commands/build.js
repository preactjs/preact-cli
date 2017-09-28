import rimraf from 'rimraf';
import { resolve } from 'path';
import { isDir, error } from '../util';
import asyncCommand from '../lib/async-command';
import runWebpack, { showStats, writeJsonStats } from '../lib/webpack/run-webpack';

export default asyncCommand({
	command: 'build [src] [dest]',

	desc: 'Create a production build in build/',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
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
		prerenderUrls: {
			description: 'Path to pre-render routes configuration.',
			default: 'prerender-urls.json'
		},
		'service-worker': {
			description: 'Add a service worker to the application.',
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
		},
		config: {
			description: 'Path to custom CLI config.',
			alias: 'c'
		}
	},

	async handler(argv) {
		let cwd = resolve(argv.cwd);
		let modules = resolve(cwd, 'node_modules');

		if (!isDir(modules)) {
			return error('No `node_modules` found! Please run `npm install` before continuing.', 1);
		}

		if (argv.clean) {
			let dest = resolve(cwd, argv.dest || 'build');
			await Promise.promisify(rimraf)(dest);
		}

		let stats = await runWebpack(false, argv);

		showStats(stats);

		if (argv.json) {
			await writeJsonStats(stats);
		}
	}
});
