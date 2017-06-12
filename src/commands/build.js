import asyncCommand from '../lib/async-command';
import createCompiler from '../compiler';

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
		}
	},

	async handler(argv) {
		let compiler = createCompiler(argv);

		if (argv.clean) {
			await compiler.clean();
		}

		let stats = await compiler.compile();

		if (argv.json) {
			await compiler.writeJsonStats(stats);
		}
	}
});
