import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import glob from 'glob';
import ora from 'ora';
import gittar from 'gittar';
import { green } from 'chalk';
import { prompt } from 'inquirer';
import { resolve } from 'path';
import { install, initialize, pkgScripts, initGit, trimLeft } from './../lib/setup';
import { isDir, hasCommand, error, trim, warn } from '../util';

const TEMPLATES = {
	full: 'preactjs-templates/default',
	default: 'preactjs-templates/default',
	// simple: 'examples/simple',
	// empty: 'examples/empty',
	// root: 'examples/root',
};

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
		let isYarn = argv.yarn && hasCommand('yarn');
		let cwd = argv.cwd ? resolve(argv.cwd) : process.cwd();
		let target = argv.dest && resolve(cwd, argv.dest);
		let exists = target && isDir(target);

		if (target) {
			if (exists && !argv.force) {
				return error('Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag', 1);
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
					return error('Refusing to overwrite current directory!', 1);
				}
			}
		} else {
			// TODO: interactive
		}

		let repo = TEMPLATES[argv.template] || argv.template;

		// Attempt to fetch the `template`
		let archive = await gittar.fetch(repo).catch(err => {
			err = err || { message:'An error occured while fetching template.' };
			return error(err.code === 404 ? `Could not find repostory: ${repo}` : err.message, 1);
		});

		let spinner = ora({
			text: 'Creating project',
			color: 'magenta'
		}).start();

		// Extract files from `archive` to `target`
		await gittar.extract(archive, target, {
			filter(path) {
				// TODO: remove this?
				return !/\/build\//.test(path);
			}
		});

		spinner.text = 'Initializing project';

		await initialize(target, isYarn);

		// Construct user's `package.json` file
		let pkgFile = resolve(target, 'package.json');
		let pkgData = JSON.parse(await fs.readFile(pkgFile));

		pkgData.scripts = pkgScripts(pkgData, isYarn);

		if (argv.name) {
			pkgData.name = argv.name;
			// Find a `manifest.json`; use the first match, if any
			let files = await Promise.promisify(glob)(target + '/**/manifest.json');
			let manifest = files[0] && JSON.parse(await fs.readFile(files[0]));
			if (manifest) {
				manifest.name = manifest.short_name = argv.name;
				await fs.writeFile(files[0], JSON.stringify(manifest, null, 2));
				if (argv.name.length > 12) {
					// @see https://developer.chrome.com/extensions/manifest/name#short_name
					process.stdout.write('\n');
					warn('Your `short_name` should be fewer than 12 characters.');
				}
			}
		}

		if (!isDir(resolve(target, 'src'))) {
			pkgData.scripts.test = pkgData.scripts.test.replace('src', '.');
		}

		pkgData.eslintConfig = {
			extends: 'eslint-config-synacor'
		};

		await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2));

		if (argv.install) {
			spinner.text = 'Installing all dependencies';
			await install(target, isYarn);
		}

		spinner.succeed('Done!\n');

		if (argv.git) {
			await initGit(target);
		}

		let pfx = isYarn ? 'yarn' : 'npm run';

		return trimLeft(`
			To get started, cd into the new directory:
			  ${ green('cd ' + argv.dest) }

			To start a development live-reload server:
			  ${ green(pfx + ' start') }

			To create a production build (in ./build):
			  ${ green(pfx + ' build') }

			To start a production HTTP/2 server:
			  ${ green(pfx + ' serve') }
		`) + '\n';
	}
});
