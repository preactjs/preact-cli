import crossSpawn from 'cross-spawn-promise';
import { spawn as spawnChild } from 'child_process';
import path from 'path';
import mkdirp from 'mkdirp';
import { createWorkDir } from './output';
import withLog from './log';

export const create = async (appName, template) => {
	let workDir = createWorkDir();
	await withLog(() => mkdirp(workDir), 'Create work directory');
	await withLog(
		() => createApp(template, appName, workDir),
		'preact create'
	);

	let appDir = path.resolve(workDir, appName);
	await withLog(
		() => run('npm', ['i', '--save-dev', path.relative(appDir, process.cwd())], appDir),
		'Install local preact-cli'
	);

	return appDir;
};

export const build = appDir => withLog(
	() => preact(['build'], appDir),
	'preact build'
);


export const serve = (appDir, port) => withLog(
	() => spawn(['serve', port ? `-p=${port}` : undefined], appDir),
	'preact serve'
);

export const watch = (appDir, port) => withLog(
	() => spawn(['watch', port ? `-p=${port}` : undefined], appDir),
	'preact watch'
);

export const getSpawnedProcesses = () => spawnedProcesses;

const createApp = async (template, appName, workDir) => {
	let cliPath = path.resolve(__dirname, '../../lib/index.js');
	let args = [cliPath, 'create', '--no-git', appName, template ? `--type=${template}` : undefined];

	await run('node', args, workDir);
};

const preact = async (args, cwd) => {
	let cliPath = path.resolve(cwd, './node_modules/.bin/preact');
	await run(cliPath, args, cwd);
};

const run = async (command, args, cwd) => {
	try {
		await crossSpawn(command, args.filter(Boolean), { cwd });
	} catch (err) {
		if (err.stderr) {
			console.error(err.stderr.toString()); //eslint-disable-line no-console
		}

		throw err.toString();
	}
};

let spawnedProcesses = [];

const spawn = (args, cwd) => new Promise((resolve, reject) => {
	let cliPath = path.resolve(cwd, './node_modules/.bin/preact');
	let child = spawnChild('node', [cliPath, ...args.filter(Boolean)], { cwd });

	let errListener = err => {
		reject(err);
	};

	child.on('error', errListener);

	let origKill = child.kill.bind(child);
	child.kill = () => new Promise((resolve) => {
		let index = spawnedProcesses.findIndex(p => p.pid === child.pid);
		if (index > -1) {
			spawnedProcesses.splice(index, 1);
		}

		child.stdout.unpipe(process.stdout);
		child.stderr.unpipe(process.stderr);
		child.on('exit', code => {
			resolve(code);
		});
		origKill();
	});

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	spawnedProcesses.push(child);

	setTimeout(() => {
		child.removeListener('error', errListener);
		resolve(child);
	}, 500);
});
