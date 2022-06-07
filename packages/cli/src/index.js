#!/usr/bin/env node
const envinfo = require('envinfo');
const sade = require('sade');
const notifier = require('update-notifier');
const { error } = require('./util');
const pkg = require('../package.json');

const ver = process.version;
const min = pkg.engines.node;
if (
	ver
		.substring(1)
		.localeCompare(min.match(/\d+/g).join('.'), 'en', { numeric: true }) === -1
) {
	error(
		`You are using Node ${ver} but preact-cli requires Node ${min}. Please upgrade Node to continue!\n`
	);
}

// Safe to load async-based funcs
const commands = require('./commands');

// installHooks();
notifier({ pkg }).notify();

process.on('unhandledRejection', err => {
	error(err.stack || err.message);
});

const prog = sade('preact').version(pkg.version);

prog
	.command('build [src]')
	.describe(
		'Create a production build. You can disable "default: true" flags by prefixing them with --no-<option>'
	)
	.option('--src', 'Specify source directory', 'src')
	.option('--dest', 'Specify output directory', 'build')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--esm', 'Builds ES-2015 bundles for your code', false)
	.option('--sw', 'Generate and attach a Service Worker', true)
	.option('--babelConfig', 'Path to custom Babel config', '.babelrc')
	.option('--json', 'Generate build stats for bundle analysis', false)
	.option(
		'--template',
		'Path to custom HTML template (default "src/template.html")'
	)
	.option(
		'--preload',
		'Adds preload links to the HTML for required resources',
		false
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
	.option('--brotli', 'Builds brotli compressed bundles of JS resources', false)
	.option('--inline-css', 'Adds critical CSS to the prerendered HTML', true)
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('-v, --verbose', 'Verbose output', false)
	.action(commands.build);

prog
	.command('create [template] [dest]')
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!', false)
	.option('--install', 'Install dependencies', true)
	.option(
		'--yarn',
		'Use `yarn` instead of `npm` to install dependencies',
		false
	)
	.option('--git', 'Initialize Git repository', false)
	.option('--license', 'License type', 'MIT')
	.option('-v, --verbose', 'Verbose output', false)
	.action(commands.create);

prog
	.command('watch [src]')
	.describe('Start a live-reload server for development')
	.option('--src', 'Specify source directory', 'src')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--esm', 'Builds ES-2015 bundles for your code', false)
	.option('--clear', 'Clears the console when the devServer updates', true)
	.option('--sw', 'Generate and attach a Service Worker')
	.option('--babelConfig', 'Path to custom Babel config', '.babelrc')
	.option('--rhl', 'Deprecated, use --refresh instead', false)
	.option('--refresh', 'Enables experimental prefresh functionality', false)
	.option('--json', 'Generate build stats for bundle analysis', false)
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
	.action(commands.watch);

prog.command('list').describe('List official templates').action(commands.list);

prog
	.command('info')
	.describe('Print out debugging information about the local environment')
	.action(() => {
		envinfo
			.run({
				System: ['OS', 'CPU'],
				Binaries: ['Node', 'Yarn', 'npm'],
				Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
				npmPackages: [
					'preact',
					'preact-compat',
					'preact-cli',
					'preact-router',
					'preact-render-to-string',
				],
				npmGlobalPackages: ['preact-cli'],
			})
			.then(info => process.stdout.write(`\nEnvironment Info:${info}\n`));
	});

prog.parse(process.argv, {
	unknown: arg => {
		const cmd = process.argv[2];
		error(
			`Invalid argument '${arg}' passed to ${cmd}. Please refer to 'preact ${cmd} --help' for the full list of options.\n`
		);
	},
});
