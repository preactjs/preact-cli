import { resolve } from 'path';
import { spawn } from 'child_process';
import crossSpawn from 'cross-spawn-promise';
import { tmpDir } from './output';
import { log } from './utils';

const CLI = require.resolve('../../lib');
const NOINSTALL = !!process.env.SKIP_INSTALL;

export async function create(template, name) {
	let dest = tmpDir();
	let args = [CLI, 'create', template, dest];

	name && args.push(`--name ${name}`);
	NOINSTALL && args.push('--no-install');

	await run('node', args);

	return dest;
}

export const build = appDir => log(
	() => preact(['build'], appDir),
	'preact build'
);

export const serve = (appDir, port) => log(
	() => spawnPreact(['serve', port ? `-p=${port}` : undefined], appDir),
	'preact serve'
);

export const watch = (appDir, host, port) => log(
	() => spawnPreact(['watch', host ? `--host=${host}` : undefined, port ? `-p=${port}` : undefined], appDir),
	'preact watch'
);

const preact = async (args, cwd) => {
	await run('node', [cliPath(cwd), ...args], cwd);
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

const spawnPreact = (args, cwd) => new Promise((resolve, reject) => {
	let child = spawn('node', [cliPath(cwd), ...args.filter(Boolean)], { cwd });
	let exitCode, killed = false;
	let errListener = err => {
		reject(err);
	};

	child.on('error', errListener);
	child.on('exit', code => {
		killed = true;
		exitCode = code;
	});

	let origKill = child.kill.bind(child);
	child.kill = () => new Promise((resolve) => {
		child.stdout.unpipe(process.stdout);
		child.stderr.unpipe(process.stderr);
		if (killed) {
			resolve(exitCode);
		} else {
			child.on('exit', (code) => {
				resolve(code);
			});
		}

		origKill();
	});

	child.stdout.pipe(process.stdout);
	child.stderr.pipe(process.stderr);

	setTimeout(() => {
		child.removeListener('error', errListener);
		resolve(child);
	}, 500);
});

const cliPath = cwd => NOINSTALL ? CLI : resolve(cwd, './node_modules/.bin/preact');
