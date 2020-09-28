#!/usr/bin/env node
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

process.on('unhandledRejection', (err) => {
	error(err.stack || err.message);
});

let prog = sade('preact').version(pkg.version);

prog
	.command('create [template] [dest]')
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!', false)
	.option('--install', 'Install dependencies', true)
	.option('--yarn', 'Use `yarn` instead of `npm`', false)
	.option('--git', 'Initialize git repository', false)
	.option('--license', 'License type', 'MIT')
	.option('-v, --verbose', 'Verbose output', false)
	.action(commands.create);

prog.command('list').describe('List official templates').action(commands.list);

prog.parse(process.argv);
