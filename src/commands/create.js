import asyncCommand from '../lib/async-command';
import fs from 'fs.promised';
import copy from 'recursive-copy';
import mkdirp from 'mkdirp';
import ora from 'ora';
import promisify from 'es6-promisify';
import spawn from 'cross-spawn-promise';
import path from 'path';
import install from '../lib/install-dependencies';

const TEMPLATES = {
	default: 'examples/root',
	empty: 'examples/empty',
	full: 'examples/full',
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
				'full',
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

		await spawn('npm', ['init', '-y'], { cwd: target, stdio: 'ignore' });

		let pkg = JSON.parse(await fs.readFile(path.resolve(target, 'package.json')));

		pkg.scripts = {
			start: 'if-env NODE_ENV=production && npm run -s serve || npm run -s dev',
			build: 'preact build',
			serve: 'preact build && preact serve',
			dev: 'preact watch',
			test: 'eslint src && preact test'
		};

		pkg.eslintConfig = {
			extends: 'eslint-config-synacor'
		};

		await fs.writeFile(path.resolve(target, 'package.json'), JSON.stringify(pkg, null, 2));

		spinner.text = 'Installing dev dependencies';

		await install(target, [
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
		], 'dev');

		spinner.text = 'Installing dependencies';

		await install(target, [
			'preact',
			'preact-compat',
			'preact-router'
		]);

		spinner.succeed('Done!\n');

		return `
			To get started, cd into the new directory:
			  \u001b[32mcd ${path.relative(process.cwd(), target)}\u001b[39m

			To start a development live-reload server:
			  \u001b[32mnpm start\u001b[39m

			To create a production build in build/:
			  \u001b[32mnpm run build\u001b[39m

			To start a production HTTP/2 server:
			  \u001b[32mnpm run serve\u001b[39m
		`.trim().replace(/^\t+/gm, '') + '\n';
	}
});
