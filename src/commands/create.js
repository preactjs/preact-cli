import fs from 'fs.promised';
import { resolve } from 'path';
import ora from 'ora';
import glob from 'glob';
import gittar from 'gittar';
import { green } from 'chalk';
import { prompt } from 'inquirer';
import asyncCommand from '../lib/async-command';
import { info, isDir, hasCommand, error, trim, warn } from '../util';
import { install, initGit, addScripts, isMissing } from './../lib/setup';

const ORG = 'preactjs-templates';

export default asyncCommand({
	command: 'create [template] [dest]',

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
		// Prompt if incomplete data
		if (!argv.dest || !argv.template) {
			warn('Insufficient command arguments! Prompting...');
			info('Alternatively, run `preact create --help` for usage info.');

			let questions = isMissing(argv);
			let response = await prompt(questions);
			Object.assign(argv, response);
		}

		let isYarn = argv.yarn && hasCommand('yarn');
		let cwd = argv.cwd ? resolve(argv.cwd) : process.cwd();
		let target = argv.dest && resolve(cwd, argv.dest);
		let exists = target && isDir(target);

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
				info('Initializing project in the current directory!');
			} else {
				return error('Refusing to overwrite current directory!', 1);
			}
		}

		let repo = argv.template;
		if (!repo.includes('/')) {
			repo = `${ORG}/${repo}`;
			info(`Assuming you meant ${repo}...`);
		}

		// Attempt to fetch the `template`
		let archive = await gittar.fetch(repo).catch(err => {
			err = err || { message:'An error occured while fetching template.' };
			return error(err.code === 404 ? `Could not find repository: ${repo}` : err.message, 1);
		});

		let spinner = ora({
			text: 'Creating project',
			color: 'magenta'
		}).start();

		// Extract files from `archive` to `target`
		// TODO: read & respond to meta/hooks
		let hasDir = false;
		await gittar.extract(archive, target, {
			strip: 2,
			filter(path) {
				return path.includes('/template/') && (hasDir = true);
			}
		});

		if (!hasDir) {
			return error(`No \`template\` directory found within ${ repo }!`, 1);
		}

		spinner.text = 'Parsing `package.json` file';

		// Validate user's `package.json` file
		let pkgData;
		let pkgFile = resolve(target, 'package.json');

		if (pkgFile) {
			pkgData = JSON.parse(await fs.readFile(pkgFile));
			// Write default "scripts" if none found
			pkgData.scripts = pkgData.scripts || (await addScripts(pkgData, target, isYarn));
		} else {
			warn('Could not locate `package.json` file!');
		}

		if (argv.name) {
			// Update `package.json` key
			if (pkgData) {
				spinner.text = 'Updating `name` within `package.json` file';
				pkgData.name = argv.name.toLowerCase().replace(/\s+/g, '_');
			}
			// Find a `manifest.json`; use the first match, if any
			let files = await Promise.promisify(glob)(target + '/**/manifest.json');
			let manifest = files[0] && JSON.parse(await fs.readFile(files[0]));
			if (manifest) {
				spinner.text = 'Updating `name` within `manifest.json` file';
				manifest.name = manifest.short_name = argv.name;
				// Write changes to `manifest.json`
				await fs.writeFile(files[0], JSON.stringify(manifest, null, 2));
				if (argv.name.length > 12) {
					// @see https://developer.chrome.com/extensions/manifest/name#short_name
					process.stdout.write('\n');
					warn('Your `short_name` should be fewer than 12 characters.');
				}
			}
		}

		if (pkgData) {
			// Assume changes were made ¯\_(ツ)_/¯
			await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2));
		}

		if (argv.install) {
			spinner.text = 'Installing dependencies';
			await install(target, isYarn);
		}

		spinner.succeed('Done!\n');

		if (argv.git) {
			await initGit(target);
		}

		let pfx = isYarn ? 'yarn' : 'npm run';

		return trim(`
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
