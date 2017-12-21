#!/usr/bin/env node
import sade from 'sade';
global.Promise = require('bluebird');
import notifier from 'update-notifier';
import * as cmd from './commands';
import version from '../check';
import pkg from '../package';

version();

// installHooks();

notifier({ pkg }).notify();

let prog = sade('preact').version(pkg.version);

prog
	.command('build [src]')
	.describe('Create a production build')
	.option('--src', 'Specify source directory', 'src')
	.option('--dest', 'Specify output directory', 'build')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--json', 'Generate build stats for bundle analysis')
	.option('--template', 'Path to custom HTML template')
	.option('--prerenderUrls', 'Path to pre-rendered routes config', 'prerender-urls.json')
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.action(cmd.build);

prog
	.command('create <template> <dest>')
	.describe('Create a new application')
	.option('--name', 'The application name')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--force', 'Force destination output; will override!')
	.option('--install', 'Install dependencies', true)
	.option('--yarn', 'Use `yarn` instead of `npm`')
	.option('--git', 'Initialize git repository')
	.action(cmd.build);

prog.command('list')
	.describe('List official templates')
	.action(cmd.list);

prog
	.command('serve [dir]')
	.describe('Run a HTTP2 static fileserver')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--dir', 'Path to root directory; used for static files', 'build')
	.option('--server', 'Type of server to run; use "config" for Firebase', 'simplehttp2server')
	.option('--dest', 'Path custom Firebase config should be written', 'firebase.json')
	.option('--cors', 'Specify allowable origins', 'localhost')
	.option('-p, --port', 'Set PORT for server', 8080)
	.action(cmd.serve);

prog
	.command('watch [src]')
	.describe('Start a live-reload server for development')
	.option('--src', 'Specify source directory', 'src')
	.option('--cwd', 'A directory to use instead of $PWD', '.')
	.option('--json', 'Generate build stats for bundle analysis')
	.option('--https', 'Run server with HTTPS protocol')
	.option('--prerender', 'Pre-render static content on first run')
	.option('--template', 'Path to custom HTML template')
	.option('-c, --config', 'Path to custom CLI config', 'preact.config.js')
	.option('-H, --host', 'Set server hostname', '0.0.0.0')
	.option('-p, --port', 'Set server port', 8080)
	.action(cmd.watch);

prog.parse(process.argv);
