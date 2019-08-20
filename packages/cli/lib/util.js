const { blue, yellow, red } = require('kleur');
const { normalize, resolve } = require('path');
const { statSync, existsSync } = require('fs');
const symbols = require('./symbols');
const which = require('which');

function isDir(str) {
	return existsSync(str) && statSync(str).isDirectory();
}

function dirExits(workingDir, destDir) {
	if (workingDir && destDir) {
		const target = resolve(workingDir, destDir);
		return isDir(target);
	}
	return false;
}

exports.isDir = isDir;
exports.dirExists = dirExits;

exports.hasCommand = function(str) {
	return !!which.sync(str, { nothrow: true });
};

exports.trim = function(str) {
	return str.trim().replace(/^\t+/gm, '');
};

exports.info = function(text, code) {
	process.stderr.write(symbols.info + blue(' INFO ') + text + '\n');
	code && process.exit(code);
};

exports.warn = function(text, code) {
	process.stdout.write(symbols.warning + yellow(' WARN ') + text + '\n');
	code && process.exit(code);
};

exports.error = function(text, code) {
	process.stderr.write(symbols.error + red(' ERROR ') + text + '\n');
	code && process.exit(code);
};

exports.normalizePath = function(str) {
	return normalize(str).replace(/\\/g, '/');
};
