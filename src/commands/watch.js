import asyncCommand from '../lib/async-command';
import webpackConfig from '../lib/webpack-config';
import runWebpack, { showStats } from '../lib/run-webpack';

export default asyncCommand({
	command: 'watch [src]',

	desc: 'Start a development live-reload server.',

	builder: {
		src: {
			description: 'Entry file (index.js)',
			default: 'src'
		},
		port: {
			description: 'Port to start a server on',
			default: '8080',
			alias: 'p'
		},
		host: {
			description: 'Hostname to start a server on',
			default: '0.0.0.0',
			alias: 'h'
		},
		https: {
			description: 'Use HTTPS?',
			type: 'boolean',
			default: false
		},
		prerender: {
			description: 'Pre-render static app content on initial build',
			default: false
		}
	},

	async handler(argv) {
		argv.production = false;
		let config = webpackConfig(argv);

		let stats = await runWebpack(true, config, showStats);
		showStats(stats);
	}
});
