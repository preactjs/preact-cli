#!/usr/bin/env node
const envinfo = require('envinfo');
const sade = require('sade');
const notifier = require('update-notifier');
const { error } = require('./util');
const pkg = require('../package');

const ver = process.version;
const min = pkg.engines.node;
if (
	ver
		.substring(1)
		.localeCompare(min.match(/\d+/g).join('.'), 'en', { numeric: true }) === -1
) {
	return error(
		`You are using Node ${ver} but preact-cli requires Node ${min}. Please upgrade Node to continue!`,
		1
	);
}

// Safe to load async-based funcs
const commands = require('./commands');

// installHooks();
notifier({ pkg }).notify();

process.on('unhandledRejection', err => {
	error(err.stack || err.message);
});

let prog = sade('preact').version(pkg.version);

prog
	.command('build [src]')
	.describe('Create a production build')
	.option('--src', 'Specify source directory', 'src')
	.option('--dest', 'Specify output directory', 'build')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--sw', 'Generate and attach a Service Worker', true)
	.option('--json', 'Generate build stats for bundle analysis')
	.option('--template', 'Path to custom HTML template')
	.option('--preload', 'Adds preload tags to the document its assets', false)
	.option(
		'--analyze',
		'Launch interactive Analyzer to inspect production bundle(s)'
	)
	.option(
		'--prerenderUrls',
		'Path to pre-rendered routes config',
		'prerender-urls.json'
	)
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('--esm', 'Builds ES-2015 bundles for your code.', true)
	.option('--brotli', 'Adds brotli redirects to the service worker.', false)
	.option('--inline-css', 'Adds critical css to the prerendered markup.', true)
	.option('-v, --verbose', 'Verbose output')
	.action(commands.build);

prog
	.command('create [template] [dest]')
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!')
	.option('--install', 'Install dependencies', true)
	.option('--yarn', 'Use `yarn` instead of `npm`')
	.option('--git', 'Initialize git repository')
	.option('-v, --verbose', 'Verbose output')
	.action(commands.create);

prog
	.command('list')
	.describe('List official templates')
	.action(commands.list);

prog
	.command('watch [src]')
	.describe('Start a live-reload server for development')
	.option('--src', 'Specify source directory', 'src')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--esm', 'Builds ES-2015 bundles for your code.', true)
	.option('--sw', 'Generate and attach a Service Worker', false)
	.option('--rhl', 'Enable react hot loader', false)
	.option('--json', 'Generate build stats for bundle analysis')
	.option('--https', 'Run server with HTTPS protocol')
	.option('--key', 'Path to PEM key for custom SSL certificate')
	.option('--cert', 'Path to custom SSL certificate')
	.option('--cacert', 'Path to optional CA certificate override')
	.option('--prerender', 'Pre-render static content on first run')
	.option('--template', 'Path to custom HTML template')
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('-H, --host', 'Set server hostname', '0.0.0.0')
	.option('-p, --port', 'Set server port', 8080)
	.action(commands.watch);

prog
	.command('info')
	.describe('Print out debugging information about the local environment')
	.action(() => {
		console.log();
		console.log('Environment Info:');
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
			.then(console.log);
	});

prog.parse(process.argv);
