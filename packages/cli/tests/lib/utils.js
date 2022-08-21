/* eslint-disable no-console */
const { join, relative, resolve } = require('path');
const { stat, symlink, readFile, writeFile } = require('fs').promises;
const pRetry = require('p-retry');
const { promisify } = require('util');
const glob = promisify(require('glob').glob);

const LOG = !!process.env.WITH_LOG;
const logger = (lvl, msg) => (lvl === 'error' || LOG) && console[lvl](msg);

// `node-glob` ignore pattern buggy?
const ignores = x => !/node_modules|package-lock|yarn.lock/i.test(x);

function expand(dir, opts) {
	dir = resolve(dir);
	opts = Object.assign({ dot: true, nodir: true }, opts);
	return glob(`${dir}/**/*.*`, opts).then(arr => arr.filter(ignores));
}

async function bytes(str) {
	// Sourcemap paths will be different in different environments,
	// and therefore not useful to test. This strips them out before
	// file size comparisons.
	if (/\.map$/.test(str)) {
		let fileContent = await readFile(str, 'utf-8');
		fileContent = fileContent.replace(/"sources":[^\]]*]/, '');
		await writeFile(str, fileContent);
	}
	return (await stat(str)).size;
}

async function snapshot(dir) {
	let str,
		tmp,
		out = {};
	for (str of await expand(dir)) {
		tmp = relative(dir, str);
		out[tmp] = await bytes(str);
	}
	return out;
}

async function log(fn, msg) {
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

function waitUntil(action, errorMessage) {
	return pRetry(action, { retries: 10, minTimeout: 250 }).catch(err => {
		console.log('> waitUntil error', err);
		throw new Error(errorMessage);
	});
}

const sleep = promisify(setTimeout);

async function linkPackage(name, cwd) {
	const root = join(__dirname, '../../../..');
	try {
		await symlink(
			join(root, 'node_modules', name),
			join(cwd, 'node_modules', name)
		);
	} catch {}
}

expect.extend({
	toFindMatchingKey(key, matchingKey) {
		if (matchingKey) {
			return {
				message: () => `expected '${key}'' not to exist in received keys`,
				pass: true,
			};
		}
		return {
			message: () => `expected '${key}' to exist in received keys`,
			pass: false,
		};
	},
	toBeCloseInSize(key, receivedSize, expectedSize) {
		const expectedMin = expectedSize * 0.95;
		const expectedMax = expectedSize * 1.05;

		const message = (comparator, val) =>
			`expected '${key}' to be ${comparator} than ${val}, but it's ${receivedSize}`;

		if (receivedSize < expectedMin) {
			return {
				message: () => message('greater', expectedMin),
				pass: false,
			};
		}

		if (receivedSize > expectedMax) {
			return {
				message: () => message('less', expectedMax),
				pass: false,
			};
		}

		return {
			message: () => '',
			pass: true,
		};
	},
});

module.exports = {
	expand,
	bytes,
	snapshot,
	log,
	waitUntil,
	sleep,
	linkPackage,
};
