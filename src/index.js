#!/usr/bin/env node

import updateNotifier from 'update-notifier';
import yargs from 'yargs';
import create from './commands/create';
import build from './commands/build';
import watch from './commands/watch';
import serve from './commands/serve';
import list from './commands/list';
import installHooks from './lib/output-hooks';
import pkg from '../package.json';
import logo from './lib/logo';
import checkVersion from './../check';

global.Promise = require('bluebird');

checkVersion();

installHooks();

updateNotifier({pkg}).notify();

yargs
	.command(create)
	.command(build)
	.command(watch)
	.command(serve)
	.command(list)
	.usage(logo(`\n\npreact-cli ${pkg.version}`) + `\nFor help with a specific command, enter:\n  preact help [command]`)
	.help()
	.alias('h', 'help')
	.demandCommand()
	.strict()
	.argv;

