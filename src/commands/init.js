import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import copy from 'recursive-copy';
import glob from 'glob';
import mkdirp from 'mkdirp';
import ora from 'ora';
import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import { install, initialize, pkgScripts, initGit, trimLeft } from './../lib/setup';

const TEMPLATES = {
	full: 'examples/full',
	empty: 'examples/empty',
	root: 'examples/root',
	simple: 'examples/simple'
};

export default asyncCommand({
	command: 'init',

	desc: 'Create a new application interactively',

	builder: {
		default: {
			description: 'Use default values',
			type: 'boolean',
			alias: 'y',
			default: false
		}
	},

	async handler(argv) {
		const questions = [
			{
				type: 'input',
				name: 'name',
				message: 'Package name for the app',
				default: 'my_app'
			},
			{
				type: 'input',
				name: 'dest',
				message: 'Directory to create the app within',
				default: '<name>'
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
		];

		let response;

		if (argv.default) {
			response = {
				name: 'my_app',
				dest: 'my_app',
				type: 'full',
				style: 'css',
				yarn: false,
				git: false,
				install: true,
				enableForce: false
			};

			process.stdout.write('\nUsing the following default values:\n');
			process.stdout.write(JSON.stringify(response, null, '  ') + '\n\n');
		} else {
			process.stdout.write('\n');
			response = await inquirer.prompt(questions);

			if (response.dest === '<name>') {
				response.dest = response.name;
			}
		}

		let template = TEMPLATES[response.type];

		if (!template) {
			throw Error(`Unknown app template "${response.type}".`);
		}

		let target = path.resolve(process.cwd(), response.dest || response.name);

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
			await Promise.promisify(mkdirp)(target);
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
		}

		spinner.succeed('Done!\n');

		if (response.style !== 'css') {
			let extension;

			if (response.style === 'less') extension = '.less';
			if (response.style === 'sass') extension = '.scss';
			if (response.style === 'stylus') extension = '.styl';

			const cssFiles = await Promise.promisify(glob)(`${target}/**/*.css`, {
				ignore: [
					`${target}/build/**`,
					`${target}/node_modules/**`
				]
			});

			const changeExtension = fileName => fs.rename(fileName, fileName.replace(/.css$/, extension));

			await Promise.all(cssFiles.map(changeExtension));
		}

		if (response.git) {
			await initGit(target);
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
