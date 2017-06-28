import crossSpawn from 'cross-spawn-promise';
import { spawn as spawnChild } from 'child_process';
import { resolve } from 'path';
import mkdirp from 'mkdirp';
import { createWorkDir } from './output';

const cliPath = resolve(__dirname, '../../lib/index.js');

export const create = async (appName, template) => {
	let workDir = createWorkDir();
	await mkdirp(workDir);
	await run(['create', appName, '--no-install', template ? `--type=${template}` : undefined], workDir);
	return resolve(workDir, appName);
};

export const build = async (appDir, args = []) => {
	await run(['build', ...args], appDir);
};

export const serve = async (appDir, port) => {
	return await spawn(['serve', port ? `-p=${port}` : undefined], appDir);
};

export const watch = async (appDir, port) => {
	return await spawn(['watch', port ? `-p=${port}` : undefined], appDir);
};

export const getSpawnedProcesses = () => {
	return spawnedProcesses;
};

const run = async (args, cwd) => {
	try {
		await crossSpawn('node', [cliPath, ...args.filter(Boolean)], { cwd });
	} catch (err) {
		if (err.stderr) {
			console.error(err.stderr.toString()); //eslint-disable-line no-console
		}

		throw err.toString();
	}
};

let spawnedProcesses = [];

const spawn = (args, cwd) => new Promise((resolve, reject) => {
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
