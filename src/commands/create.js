import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import copy from 'recursive-copy';
import mkdirp from 'mkdirp';
import ora from 'ora';
import promisify from 'es6-promisify';
import spawn from 'cross-spawn-promise';
import path from 'path';
import which from 'which';

const TEMPLATES = {
	default: 'examples/full',
	full: 'examples/full',
	empty: 'examples/empty',
	root: 'examples/root',
	simple: 'examples/simple'
};

export default asyncCommand({
	command: 'create <name> [dest]',

	desc: 'Create a new application.',

	builder: {
		name: {
			description: 'directory and package name for the new app'
		},
		dest: {
			description: 'Directory to create the app within',
			defaultDescription: '<name>'
		},
		type: {
			description: 'A project template to start from',
			choices: [
				'default',
				'root',
				'simple',
				'empty'
			],
			default: 'default'
		},
		less: {
			description: 'Pre-install LESS support',
			type: 'boolean',
			default: false
		},
		sass: {
			description: 'Pre-install SASS/SCSS support',
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
		let template = TEMPLATES[argv.type];

		if (!template) {
			throw Error(`Unknown app template "${argv.type}".`);
		}

		let target = path.resolve(process.cwd(), argv.dest || argv.name);

		let exists = false;
		try {
			exists = (await fs.stat(target)).isDirectory();
		}
		catch (err) {}

		if (exists) {
			throw Error('Directory already exists.');
		}

		let spinner = ora({
			text: 'Creating project',
			color: 'magenta'
		}).start();

		await promisify(mkdirp)(target);

		await copy(
			path.resolve(__dirname, '../..', template),
			target,
			{ filter: ['**/*', '!build'] }
		);

		spinner.text = 'Initializing project';

		await npm(target, ['init', '-y']);

		let pkg = JSON.parse(await fs.readFile(path.resolve(target, 'package.json')));

		pkg.scripts = {
			...(pkg.scripts || {}),
			start: 'if-env NODE_ENV=production && npm run -s serve || npm run -s dev',
			build: 'preact build',
			serve: 'preact build && preact serve',
			dev: 'preact watch',
			test: 'eslint src && preact test'
		};

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

		if (argv.install) {
			spinner.text = 'Installing dev dependencies';

			await npm(target, [
				'install', '--save-dev',
				'preact-cli',
				'if-env',
				'eslint',
				'eslint-config-synacor',

				// install sass setup if --sass
				...(argv.sass ? [
					'node-sass',
					'sass-loader'
				] : []),

				// install less setup if --less
				...(argv.less ? [
					'less',
					'less-loader'
				] : [])
			].filter(Boolean));

			spinner.text = 'Installing dependencies';

			await npm(target, [
				'install', '--save',
				'preact',
				'preact-compat',
				'preact-router'
			]);

			spinner.succeed('Done!\n');
      
  		await initializeVersionControl(target);
		}

		return trimLeft(`
			To get started, cd into the new directory:
			  \u001b[32mcd ${path.relative(process.cwd(), target)}\u001b[39m

			To start a development live-reload server:
			  \u001b[32mnpm start\u001b[39m

			To create a production build (in ./build):
			  \u001b[32mnpm run build\u001b[39m

			To start a production HTTP/2 server:
			  \u001b[32mnpm run serve\u001b[39m
		`) + '\n';
	}
});

const trimLeft = (string) => string.trim().replace(/^\t+/gm, '');

const npm = (cwd, args) => spawn('npm', args, { cwd, stdio: 'ignore' });

// Initializes the folder using `git init` and a proper `.gitignore` file
// if `git` is present in the $PATH.
async function initializeVersionControl(target) {
  let git;
  try {
    git = await promisify(which)('git');
  } catch (e) {}
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

		const gitUser = 'Preact CLI<developit@users.noreply.github.com>';
		await spawn('git', ['commit', '--author', gitUser, '-m', 'initial commit from Preact CLI'], { cwd });
	}
}
