import crossSpawn from 'cross-spawn-promise';
import { spawn as spawnChild } from 'child_process';
import { resolve } from 'path';

const cli = resolve(__dirname, '../lib/index.js');

export default async (args, cwd) => {
	try {
		await crossSpawn('node', [cli, ...args], { cwd });
	} catch (err) {
		if (err.stderr) {
			console.error(err.stderr.toString());
		}

		throw err.toString();
	}
};

export const spawn = (args, cwd) => {
	let child = spawnChild('node', [cli, ...args], { cwd });

	child.on('error', err => {
		throw err;
	});

	return child;
};
