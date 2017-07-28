import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import copy from 'recursive-copy';
import glob from 'glob';
import mkdirp from 'mkdirp';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import promisify from 'es6-promisify';
import spawn from 'cross-spawn-promise';
import path from 'path';
import which from 'which';
import { install, initialize, pkgScripts } from './../lib/setup';

const TEMPLATES = {
	full: 'examples/full',
	empty: 'examples/empty',
	root: 'examples/root',
	simple: 'examples/simple'
};

export default asyncCommand({
	command: 'init',

	desc: 'Create a new application interactively',

	async handler(argv) {
		const questions = [
			{
				type: 'input',
				name: 'appName',
				message: 'Directory and package name for the app',
				default: 'my_app'
			},
			{
				type: 'input',
				name: 'destination',
				message: 'Directory to create the app within',
				default: '<appName>'
			},
			{
				type: 'list',
				name: 'type',
				message: 'A project template to start from',
				choices: ['full', 'root', 'simple', 'empty'],
				default: 'full',
			},
			{
				type: 'list',
				name: 'style',
				message: 'Choose CSS type for the application',
				choices: [
					'css',
					'less',
					'sass',
					'stylus'
				],
				default: 'css'
			},
			{
				type: 'confirm',
				name: 'yarn',
				message: "Use 'YARN' instead of 'NPM'",
				default: false
			},
			{
				type: 'confirm',
				name: 'git',
				message: "Initiate version control using git",
				default: false
			},
			{
				type: 'confirm',
				name: 'install',
				message: 'Install dependencies for the app',
				deafult: true
			},
			{
				type: 'confirm',
				name: 'enableForce',
				message: 'Force option to create the directory for the new app',
				default: false,
			}
		]

		process.stderr.write('\n');
		let response = await inquirer.prompt(questions);

		if (response.destination === '<appName>') {
			response.destination = response.appName;
		}

		let template = TEMPLATES[response.type];

		if (!template) {
			throw Error(`Unknown app template "${response.type}".`);
		}

		let target = path.resolve(process.cwd(), response.destination || response.appName);

		let exists = false;
		try {
			exists = (await fs.stat(target)).isDirectory();
		}
		catch (err) {}

		if (exists && response.force) {
			if (response.enableForce) {
				process.stdout.write('Initializing project in the current directory...\n');
			} else {
				process.stderr.write(chalk.red('Error: Cannot initialize in the current directory\n'));
				process.exit(1);
			}
		}

		if (exists && !response.force) {
			process.stderr.write(chalk.red('Error: Cannot initialize in the current directory, please specify a different destination or use --force\n'));
			process.exit(1);
		}

		let spinner = ora({
			text: 'Creating project',
			color: 'magenta'
		}).start();

		if (!exists) {
			await promisify(mkdirp)(target);
		}

		await copy(
			path.resolve(__dirname, '../..', template),
			target,
			{ filter: ['**/*', '!build'] }
		);

		spinner.text = 'Initializing project';

		await initialize(response.yarn, target);

		let pkg = JSON.parse(await fs.readFile(path.resolve(target, 'package.json')));

		pkg.scripts = await pkgScripts(response.yarn, pkg);

		try {
			await fs.stat(path.resolve(target, 'src'));
		}
		catch (err) {
			pkg.scripts.test = pkg.scripts.test.replace('src', '.');
		}

		pkg.eslintConfig = {
			extends: 'eslint-config-synacor'
		};

		await fs.writeFile(path.resolve(target, 'package.json'), JSON.stringify(pkg, null, 2));

		if (response.install) {
			spinner.text = 'Installing dev dependencies';

			await install(response.yarn, target, [
				'preact-cli',
				'if-env',
				'eslint',
				'eslint-config-synacor',

				// install sass setup if --sass
				...(response.style === 'sass' ? [
					'node-sass',
					'sass-loader'
				] : []),

				// install less setup if --less
				...(response.style === 'less' ? [
					'less',
					'less-loader'
				] : []),

				// install stylus if --stylus
				...(response.style === 'stylus' ? [
					'stylus',
					'stylus-loader'
				] : [])
			], 'dev');

			spinner.text = 'Installing dependencies';

			await install(response.yarn, target, [
				'preact',
				'preact-compat',
				'preact-router'
			]);

			spinner.succeed('Done!\n');
		}

		if (response.style !== 'css') {
			let extension;

			if (response.style === 'less') extension = '.less';
			if (response.style === 'sass') extension = '.scss';
			if (response.style === 'stylus') extension = '.styl';

			const cssFiles = await promisify(glob)(`${target}/**/*.css`, {
				ignore: [
					`${target}/build/**`,
					`${target}/node_modules/**`
				]
			});

			const changeExtension = fileName => fs.rename(fileName, fileName.replace(/.css$/, extension));

			await Promise.all(cssFiles.map(changeExtension));
		}

		if (response.git) {
			await initializeVersionControl(target);
		}

		return trimLeft(`
			To get started, cd into the new directory:
			  \u001b[32mcd ${path.relative(process.cwd(), target)}\u001b[39m

			To start a development live-reload server:
			  \u001b[32m${response.yarn === true ? 'yarn start' : 'npm start'}\u001b[39m

			To create a production build (in ./build):
			  \u001b[32m${response.yarn === true ? 'yarn build' : 'npm run build'}\u001b[39m

			To start a production HTTP/2 server:
			  \u001b[32m${response.yarn === true ? 'yarn serve' : 'npm run serve'}\u001b[39m
		`) + '\n';
	}
});

const trimLeft = (string) => string.trim().replace(/^\t+/gm, '');

// Initializes the folder using `git init` and a proper `.gitignore` file
// if `git` is present in the $PATH.
async function initializeVersionControl(target) {
	let git;
	try {
		git = await promisify(which)('git');
	} catch (e) {
		process.stderr.write('Could not find git in $PATH.\n');
		process.stdout.write('Continuing without initializing version control...\n');
	}
	if (git) {
		const gitignore = trimLeft(`
		node_modules
		/build
		/*.log
		`) + '\n';
		const gitignorePath = path.resolve(target, '.gitignore');
		await fs.writeFile(gitignorePath, gitignore);

		const cwd = target;

		await spawn('git', ['init'], { cwd });
		await spawn('git', ['add', '-A'], { cwd });

		const defaultGitEmail = 'developit@users.noreply.github.com';
		const defaultGitUser = 'Preact CLI';
		let gitUser;
		let gitEmail;

		try {
			gitEmail = (await spawn('git', ['config', 'user.email'])).toString();
		} catch (e) {
			gitEmail = defaultGitEmail;
		}

		try {
			gitUser = (await spawn('git', ['config', 'user.name'])).toString();
		} catch (e) {
			gitUser = defaultGitUser;
		}

		await spawn('git', ['commit', '-m', 'initial commit from Preact CLI'], {
			cwd,
			env: {
				GIT_COMMITTER_NAME: gitUser,
				GIT_COMMITTER_EMAIL: gitEmail,
				GIT_AUTHOR_NAME: defaultGitUser,
				GIT_AUTHOR_EMAIL: defaultGitEmail
			}
		});
	}
}
