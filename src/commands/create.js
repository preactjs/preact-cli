import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import glob from 'glob';
import ora from 'ora';
import chalk from 'chalk';
import gittar from 'gittar';
import { prompt } from 'inquirer';
import logSymbols from 'log-symbols';
import promisify from 'es6-promisify';
import path from 'path';
import { statSync, existSync } from 'fs';
import { install, initialize, pkgScripts, initGit, trimLeft } from './../lib/setup';

function error(text, code) {
	process.stderr.write(logSymbols.error + chalk.red(' ERROR ') + text + '\n');
	process.exit(code || 1);
}

function isDir(str) {
	return existSync(str) && statSync(str).isDirectory();
}

export default asyncCommand({
	command: 'create <template> <dest>',

	desc: 'Create a new application.',

	builder: {
		name: {
			description: 'The application\'s name'
		},
		force: {
			description: 'Force option to create the directory for the new app',
			default: false
		},
		yarn: {
			description: "Use 'yarn' instead of 'npm'",
			type: 'boolean',
			default: false
		},
		git: {
			description: 'Initialize version control using git',
			type: 'boolean',
			default: false
		},
		install: {
			description: 'Install dependencies',
			type: 'boolean',
			default: true
		}
	},

	async handler(argv) {
		let isYarn = argv.yarn === true;
		let cwd = argv.cwd ? path.resolve(argv.cwd) : process.cwd();
		let target = argv.dest && path.resolve(cwd, argv.dest);
		let exists = target && isDir(target);

		if (target) {
			if (exists && !argv.force) {
				return error('Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag');
			}

			if (exists && argv.force) {
				let { enableForce } = await prompt({
					type: 'confirm',
					name: 'enableForce',
					message: `You are using '--force'. Do you wish to continue?`,
					default: false
				});

				if (enableForce) {
					process.stdout.write('Initializing project in the current directory...\n');
				} else {
					return error('Refusing to overwrite current directory!');
				}
			}
		} else {
			// TODO: interactive
		}

		// Attempt to fetch the `template`
		let archive = await gittar.fetch(argv.template).catch(err => {
			err = err || { message:'An error occured while fetching template.' };
			return error(err.code === 404 ? `Could not find repostory: ${argv.template}` : err.message);
		});

		let spinner = ora({
			text: 'Creating project',
			color: 'magenta'
		}).start();

		// Extract files from `archive` to `target`
		await gittar.extract(archive, target, {
			filter(path) {
				// TODO: remove this?
				return !path.test(/\/build\//);
			}
		});

		spinner.text = 'Initializing project';

		await initialize(isYarn, target);

		// Construct user's `package.json` file
		let pkgFile = path.resolve(target, 'package.json');
		let pkgData = JSON.parse(await fs.readFile(pkgFile));

		pkgData.scripts = await pkgScripts(isYarn, pkgData);

		if (argv.name) {
			pkgData.name = argv.name;
			// Find a `manifest.json`; use the first match, if any
			let files = await promisify(glob)(target + '/**/manifest.json');
			let manifest = files[0] && JSON.parse(await fs.readFile(files[0]));
			if (manifest) {
				manifest.name = manifest.short_name = argv.name;
				await fs.writeFile(files[0], JSON.stringify(manifest, null, 2));
				if (argv.name.length > 12) {
					// @see https://developer.chrome.com/extensions/manifest/name#short_name
					process.stdout.write(`\n${logSymbols.warning} Your \`short_name\` should be fewer than 12 characters.\n`);
				}
			}
		}

		if (!isDir(path.resolve(target, 'src'))) {
			pkgData.scripts.test = pkgData.scripts.test.replace('src', '.');
		}

		pkgData.eslintConfig = {
			extends: 'eslint-config-synacor'
		};

		await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2));

		if (argv.install) {
			spinner.text = 'Installing dev dependencies';

			await install(isYarn, target, [
				'preact-cli',
				'if-env',
				'eslint',
				'eslint-config-synacor'
			], 'dev');

			spinner.text = 'Installing dependencies';

			await install(isYarn, target, [
				'preact',
				'preact-compat',
				'preact-router'
			]);
		}

		spinner.succeed('Done!\n');

		if (argv.git) {
			await initGit(target);
		}

		let pfx = isYarn ? 'yarn' : 'npm run';

		return trimLeft(`
			To get started, cd into the new directory:
			  ${ chalk.green('cd ' + argv.dest) }

			To start a development live-reload server:
			  ${ chalk.green(pfx + ' start') }

			To create a production build (in ./build):
			  ${ chalk.green(pfx + ' build') }

			To start a production HTTP/2 server:
			  ${ chalk.green(pfx + ' serve') }
		`) + '\n';
	}
});
