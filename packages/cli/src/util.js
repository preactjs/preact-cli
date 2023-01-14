const { blue, yellow, red } = require('kleur');
const { normalize, resolve } = require('path');
const { statSync, existsSync } = require('fs');
const symbols = require('./symbols');
const which = require('which');
const net = require('net');

exports.isDir = function (str) {
	return existsSync(str) && statSync(str).isDirectory();
};

exports.dirExists = function (workingDir, destDir) {
	if (workingDir && destDir) {
		const target = resolve(workingDir, destDir);
		return exports.isDir(target);
	}
	return false;
};

exports.hasCommand = function (str) {
	return !!which.sync(str, { nothrow: true });
};

exports.trim = function (str) {
	return str.trim().replace(/^\t+/gm, '');
};

exports.info = function (text, code) {
	process.stdout.write(symbols.info + blue(' INFO ') + text + '\n');
	code && process.exit(code);
};

const warn = (exports.warn = function (text, code) {
	process.stdout.write(symbols.warning + yellow(' WARN ') + text + '\n');
	code && process.exit(code);
});

exports.error = function (text, code = 1) {
	process.stderr.write(symbols.error + red(' ERROR ') + text + '\n');
	code && process.exit(code);
};

exports.normalizePath = function (str) {
	return normalize(str).replace(/\\/g, '/');
};

exports.normalizeTemplatesResponse = function (repos = []) {
	return repos.map(repo => ({
		title: repo.name || '',
		value: repo.full_name || '',
		description: repo.description || '',
	}));
};

exports.toBool = function (val) {
	return val !== void 0 && val !== false && !/false|0/.test(val);
};

exports.isNodeVersionGreater = function (minimum) {
	return (
		process.version
			.substring(1)
			.localeCompare(minimum.match(/\d+/g).join('.'), 'en', {
				numeric: true,
			}) === 1
	);
};

exports.esmImport = require('esm')(module);

/**
 * Taken from: https://github.com/preactjs/wmr/blob/3401a9bfa6491d25108ad68688c067a7e17d0de5/packages/wmr/src/lib/net-utils.js#L4-Ll4
 * Check if a port is free
 * @param {number} port
 * @returns {Promise<boolean>}
 */
exports.isPortFree = async function (port) {
	try {
		await new Promise((resolve, reject) => {
			const server = net.createServer();
			server.unref();
			server.on('error', reject);
			server.listen({ port }, () => {
				server.close(resolve);
			});
		});
		return true;
	} catch (err) {
		if (err.code !== 'EADDRINUSE') throw err;
		return false;
	}
};

exports.tryResolveConfig = function (cwd, file, isDefault, verbose) {
	const path = resolve(cwd, file);
	if (existsSync(path)) {
		return path;
	} else if (!isDefault || verbose) {
		warn(`${resolve(cwd, file)} doesn't exist, using default!`);
	}
};
