#!/usr/bin/env node
const sade = require('sade');
const { create } = require('./commands/create');
const { list } = require('./commands/list');
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
		`You are using Node ${ver} but create-preact-cli requires Node ${min}. Please upgrade Node to continue!\n`
	);
}

const prog = sade('create-preact-app').version(pkg.version);

prog
	.command('create <template> <dest>', '', { default: true })
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!', false)
	.option('--install', 'Install dependencies', true)
	.option('--git', 'Initialize git repository', true)
	.action(create);

prog.command('list').describe('List official templates').action(list);

prog.parse(process.argv, {
	unknown: arg => {
		const cmd = process.argv[2];
		error(
			`Invalid argument '${arg}' passed to ${cmd}. Please refer to 'preact ${cmd} --help' for the full list of options.\n`
		);
	},
});
