const { normalize } = require('path');
const { statSync, existsSync } = require('fs');
const log = require('loglevelnext');
const which = require('which');

exports.isDir = function(str) {
	return existsSync(str) && statSync(str).isDirectory();
};

exports.hasCommand = function(str) {
	return !!which.sync(str, { nothrow: true });
};

exports.trim = function(str) {
	return str.trim().replace(/^\t+/gm, '');
};

exports.info = function(text, code) {
	log.info(text);
	// process.stderr.write(logSymbols.info + blue(' INFO ') + text + '\n');
	code && process.exit(code);
};

exports.warn = function(text, code) {
	log.warn(text);
	// process.stdout.write(logSymbols.warning + yellow(' WARN ') + text + '\n');
	code && process.exit(code);
};

exports.error = function(text, code) {
	log.error(text);
	// process.stderr.write(logSymbols.error + red(' ERROR ') + text + '\n');
	code && process.exit(code);
};

exports.normalizePath = function(str) {
	return normalize(str).replace(/\\/g, '/');
};
