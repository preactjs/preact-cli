'use strict';

exports.__esModule = true;
exports.isDir = isDir;
exports.hasCommand = hasCommand;
exports.trim = trim;
exports.info = info;
exports.warn = warn;
exports.error = error;
exports.normalizePath = normalizePath;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _which = require('which');

var _which2 = _interopRequireDefault(_which);

var _path = require('path');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isDir(str) {
	return (0, _fs.existsSync)(str) && (0, _fs.statSync)(str).isDirectory();
}

function hasCommand(str) {
	return !!_which2.default.sync(str, { nothrow: true });
}

function trim(str) {
	return str.trim().replace(/^\t+/gm, '');
}

function info(text, code) {
	process.stderr.write(_logSymbols2.default.info + _chalk2.default.blue(' INFO ') + text + '\n');
	code && process.exit(code);
}

function warn(text, code) {
	process.stdout.write(_logSymbols2.default.warning + _chalk2.default.yellow(' WARN ') + text + '\n');
	code && process.exit(code);
}

function error(text, code) {
	process.stderr.write(_logSymbols2.default.error + _chalk2.default.red(' ERROR ') + text + '\n');
	code && process.exit(code);
}

function normalizePath(path) {
	return (0, _path.normalize)(path).replace(/\\/g, '/');
}