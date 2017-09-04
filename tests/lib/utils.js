/* eslint-disable no-console */
import path from 'path';
import { stat } from 'fs.promised';
import { promisify } from 'bluebird';
import minimatch from 'minimatch';
import glob from 'glob';

const PER = 0.05; // % diff
const LOG = !!process.env.WITH_LOG;
const logger = (lvl, msg) => (lvl === 'error' || LOG) && console[lvl](msg);
const globby = promisify(glob);

// `node-glob` ignore pattern buggy?
const ignores = x => !/node_modules|package-lock|yarn.lock/i.test(x);

export function expand(dir, opts) {
	dir = path.resolve(dir);
	opts = Object.assign({ dot:true, nodir:true }, opts);
	return globby(`${dir}/**`, opts).then(arr => arr.filter(ignores));
}

export async function bytes(str) {
	return (await stat(str)).size;
}

export async function snapshot(dir) {
	let str, tmp, out={};
	for (str of await expand(dir)) {
		tmp = path.relative(dir, str);
		out[tmp] = await bytes(str);
	}
	return out;
}

const hasKey = (key, arr) => arr.find(k => minimatch(key, k)) || false;
const isWithin = (val, tar) => (val == tar) || (val > (1-PER)*tar) && (val < (1+PER)*tar);

export function isMatch(src, tar) {
	let k, tmp;
	let keys=Object.keys(tar);
	for (k in src) {
		tmp = hasKey(k, keys);
		if (!tmp) return false;
		if (!isWithin(src[k], tar[tmp])) return false;
	}
	return keys.length === Object.keys(src).length;
}

export async function log(fn, msg) {
	logger('info', `${msg} - started...`);
	try {
		let result = await fn();
		logger('info', `${msg} - done.`);
		return result;
	} catch (err) {
		logger('error', `${msg} - failed!`);
		throw err;
	}
}

export function delay(ms) {
	return new Promise(r => setTimeout(r, ms));
}

export async function waitUntil(action, errorMessage, retryCount = 10, retryInterval = 100) {
	if (retryCount < 0) {
		throw new Error(errorMessage);
	}

	try {
		if (await action()) return;
	} catch (e) { }

	await delay(retryInterval);
	await waitUntil(action, errorMessage, retryCount - 1, retryInterval);
}
