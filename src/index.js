#!/usr/bin/env node

import yargs from 'yargs';
import create from './commands/create';
import build from './commands/build';
import watch from './commands/watch';
import serve from './commands/serve';
import installHooks from './lib/output-hooks';
import pkg from '../package.json';
import logo from './lib/logo';
import checkVersion from './../check';

global.Promise = require('promise-polyfill');

checkVersion();

installHooks();

yargs
	.command(create)
	.command(build)
	.command(watch)
	.command(serve)
	.option('cwd', {
		description: 'A directory to use instead of $PWD.',
		defaultDescription: '.'
	})
	.usage(logo(`\n\npreact-cli ${pkg.version}`) + `\nFor help with a specific command, enter:\n  preact help [command]`)
	.help()
	.alias('h', 'help')
	.demandCommand()
	.strict()
	.argv;
