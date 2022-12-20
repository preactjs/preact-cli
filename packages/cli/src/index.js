#!/usr/bin/env node
const envinfo = require('envinfo');
const sade = require('sade');
const notifier = require('update-notifier');
const { green } = require('kleur');
const { error } = require('./util');
const pkg = require('../package.json');
const { isNodeVersionGreater } = require('./util');

const min = pkg.engines.node;
if (!isNodeVersionGreater(min)) {
	error(
		`You are using Node ${process.version} but preact-cli requires Node ${min}. Please upgrade Node to continue!\n`
	);
}

// Safe to load async-based funcs
const commands = require('./commands');

// installHooks();
notifier({ pkg }).notify();

const prog = sade('preact').version(pkg.version);

prog
	.command('build [src]')
	.describe(
		'Create a production build. You can disable "default: true" flags by prefixing them with --no-<option>'
	)
	.option('--src', 'Specify source directory', 'src')
	.option('--dest', 'Specify output directory', 'build')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--sw', 'Generate and attach a Service Worker', true)
	.option('--babelConfig', 'Path to custom Babel config', '.babelrc')
	.option(
		'--template',
		'Path to custom HTML template (default "src/template.html")'
	)
	.option(
		'--analyze',
		'Launch interactive Analyzer to inspect production bundle(s)',
		false
	)
	.option('--prerender', 'Renders route(s) into static HTML', true)
	.option(
		'--prerenderUrls',
		'Path to prerendered routes config',
		'prerender-urls.json'
	)
	.option('--inlineCss', 'Adds critical CSS to the prerendered HTML', true)
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('-v, --verbose', 'Verbose output', false)
	.action((src, argv) => exec(commands.build(src, argv)));

prog
	.command('watch [src]')
	.describe('Start a live-reload server for development')
	.option('--src', 'Specify source directory', 'src')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--clear', 'Clears the console when the devServer updates', true)
	.option('--sw', 'Generate and attach a Service Worker')
	.option('--babelConfig', 'Path to custom Babel config', '.babelrc')
	.option('--refresh', 'Enables experimental prefresh functionality', false)
	.option(
		'--template',
		'Path to custom HTML template (default "src/template.html")'
	)
	.option('--https', 'Run server with HTTPS protocol')
	.option('--key', 'Path to PEM key for custom SSL certificate')
	.option('--cert', 'Path to custom SSL certificate')
	.option('--cacert', 'Path to optional CA certificate override')
	.option('--prerender', 'Render route(s) into static HTML (first run only)')
	.option(
		'--prerenderUrls',
		'Path to prerendered routes config',
		'prerender-urls.json'
	)
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('-H, --host', 'Set server hostname', '0.0.0.0')
	.option('-p, --port', 'Set server port (default 8080)')
	.action((src, argv) => exec(commands.watch(src, argv)));

prog
	.command('info')
	.describe('Print out debugging information about the local environment')
	.action(() =>
		exec(envinfo
			.run({
				System: ['OS', 'CPU'],
				Binaries: ['Node', 'Yarn', 'npm'],
				Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
				npmPackages: [
					'preact',
					'preact-cli',
					'preact-router',
					'preact-render-to-string',
				],
				npmGlobalPackages: ['preact-cli'],
			})
			.then(info => process.stdout.write(`\nEnvironment Info:${info}\n`))
	));

prog.parse(process.argv, {
	alias: {
		inlineCss: ['inline-css'],
	},
	unknown: arg => {
		const cmd = process.argv[2];
		error(
			`Invalid argument '${arg}' passed to ${cmd}. Please refer to 'preact ${cmd} --help' for the full list of options.\n`
		);
	},
});

function exec(cmd) {
	cmd.catch(catchExceptions);
}

/**
 * @param {Error | import('webpack').StatsError} err
 */
async function catchExceptions(err) {
	// Webpack Stats Error
	if ('moduleName' in err && 'loc' in err) {
		error(`${err.moduleName} ${green(err.loc)}\n${err.message}\n\n`);
	}
	error(err.stack || err.message || err);
}

process.on('unhandledRejection', catchExceptions);
