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

const buildCommand = prog
	.command('build [src]')
	.describe(
		'Create a production build. You can disable "default: true" flags by prefixing them with --no-<option>'
	);
commands.buildOptions.forEach(option => {
	buildCommand.option(option.name, option.description, option.default);
});
buildCommand.action(commands.build);

const watchCommand = prog
	.command('watch [src]')
	.describe('Start a live-reload server for development');
commands.watchOptions.forEach(option => {
	watchCommand.option(option.name, option.description, option.default);
});
watchCommand.action(commands.watch);

prog
	.command('info')
	.describe('Print out debugging information about the local environment')
	.action(() => {
		process.stdout.write('\nEnvironment Info:');
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
			.then(info => process.stdout.write(`${info}\n`));
	});

prog.parse(process.argv);
