import { resolve } from 'path';
import { spawn } from 'child_process';
import * as cmd from '../../lib/commands';
import { tmpDir } from './output';
import { log } from './utils';

const CLI = require.resolve('../../lib');
const NOINSTALL = !!process.env.SKIP_INSTALL;
const cliPath = cwd => NOINSTALL ? CLI : resolve(cwd, 'node_modules/.bin/preact');

export async function create(template, name) {
	let dest = tmpDir();
	name = name || `test-${template}`;
	await cmd.create(template, dest, { name, cwd:'.' });
	return dest;
}

export function build(cwd) {
	let src='src', dest='build', config='preact.config.js', json='prerender-urls.json';
	return cmd.build({ _:[], src, dest, cwd, config, prerenderUrls:json });
}

export const serve = (appDir, port) => log(
	() => spawnPreact(['serve', port ? `-p=${port}` : undefined], appDir),
	'preact serve'
);

export const watch = (appDir, host, port) => log(
	() => spawnPreact(['watch', host ? `--host=${host}` : undefined, port ? `-p=${port}` : undefined], appDir),
	'preact watch'
);

function spawnPreact(args, cwd) {
	return new Promise((res, rej) => {
		let child = spawn('node', [cliPath(cwd), ...args.filter(Boolean)], { cwd });
		let exitCode, killed = false;
		let errListener = err => {
			rej(err);
		};

		child.on('error', errListener);
		child.on('exit', code => {
			killed = true;
			exitCode = code;
		});

		let origKill = child.kill.bind(child);
		child.kill = () => new Promise((res) => {
			child.stdout.unpipe(process.stdout);
			child.stderr.unpipe(process.stderr);
			if (killed) {
				res(exitCode);
			} else {
				child.on('exit', (code) => {
					res(code);
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
}
