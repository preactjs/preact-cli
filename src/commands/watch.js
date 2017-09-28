import getSslCert from '../lib/ssl-cert';
import asyncCommand from '../lib/async-command';
import runWebpack, { showStats } from '../lib/webpack/run-webpack';
import { warn } from '../util';

export default asyncCommand({
	command: 'watch [src]',

	desc: 'Start a development live-reload server.',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
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
			alias: 'H'
		},
		https: {
			description: 'Use HTTPS?',
			type: 'boolean',
			default: false
		},
		prerender: {
			description: 'Pre-render static app content on initial build',
			default: false
		},
		template: {
			description: 'HTML template used by webpack'
		},
		config: {
			description: 'Path to custom preact.config.js',
			alias: 'c'
		}
	},

	async handler(argv) {
		argv.production = false;

		if (argv.https || process.env.HTTPS) {
			let ssl = await getSslCert();
			if (!ssl) {
				ssl = true;
				warn('Reverting to `webpack-dev-server` internal certificate.');
			}
			argv.https = ssl;
		}

		let stats = await runWebpack(true, argv, showStats);
		showStats(stats);
	}
});
