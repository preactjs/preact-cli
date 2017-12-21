import mkdirp from 'mkdirp';
import { join, resolve } from 'path';
import * as cmd from '../../lib/commands';
import { tmpDir } from './output';
import { log } from './utils';

const argv = {
	_: [],
	src: 'src',
	dest: 'build',
	config: 'preact.config.js',
	prerenderUrls: 'prerender-urls.json',
};

export async function create(template, name) {
	let dest = tmpDir();
	name = name || `test-${template}`;
	await cmd.create(template, dest, { name, cwd:'.' });
	return dest;
}

export function build(cwd) {
	mkdirp.sync(join(cwd, 'node_modules')); // ensure exists, avoid exit()
	let opts = Object.assign({ cwd }, argv);
	return cmd.build(opts);
}

export function serve(cwd, port) {
	let opts = Object.assign({ cwd, port }, argv);
	return cmd.watch(opts);
}

export function watch(cwd, host, port) {
	let opts = Object.assign({ cwd, host, port, https:false }, argv);
	return cmd.watch(opts);
}
