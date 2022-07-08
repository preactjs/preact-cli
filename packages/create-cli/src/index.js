#!/usr/bin/env node
const sade = require('sade');
const { create } = require('./commands/create.js');
//const { create } = require('./commands/create.js)';
const { error } = require('./util.js');

const prog = sade('create-preact-app').version('0.1.3');

prog
	.command('create <template> <dest>', '', { default: true })
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!', false)
	.option('--install', 'Install dependencies', true)
	.option('--git', 'Initialize git repository', true)
	.action(create);

//prog
//    .command('list')
//    .describe('List official templates')
//    .action(list);

prog.parse(process.argv, {
	unknown: arg => {
		const cmd = process.argv[2];
		error(
			`Invalid argument '${arg}' passed to ${cmd}. Please refer to 'preact ${cmd} --help' for the full list of options.\n`
		);
	},
});
