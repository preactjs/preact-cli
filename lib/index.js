#!/usr/bin/env node
'use strict';

var _updateNotifier = require('update-notifier');

var _updateNotifier2 = _interopRequireDefault(_updateNotifier);

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _create = require('./commands/create');

var _create2 = _interopRequireDefault(_create);

var _build = require('./commands/build');

var _build2 = _interopRequireDefault(_build);

var _watch = require('./commands/watch');

var _watch2 = _interopRequireDefault(_watch);

var _serve = require('./commands/serve');

var _serve2 = _interopRequireDefault(_serve);

var _list = require('./commands/list');

var _list2 = _interopRequireDefault(_list);

var _outputHooks = require('./lib/output-hooks');

var _outputHooks2 = _interopRequireDefault(_outputHooks);

var _package = require('../package.json');

var _package2 = _interopRequireDefault(_package);

var _logo = require('./lib/logo');

var _logo2 = _interopRequireDefault(_logo);

var _check = require('./../check');

var _check2 = _interopRequireDefault(_check);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

global.Promise = require('bluebird');

(0, _check2.default)();

(0, _outputHooks2.default)();

(0, _updateNotifier2.default)({ pkg: _package2.default }).notify();

_yargs2.default.command(_create2.default).command(_build2.default).command(_watch2.default).command(_serve2.default).command(_list2.default).usage((0, _logo2.default)(`\n\npreact-cli ${_package2.default.version}`) + `\nFor help with a specific command, enter:\n  preact help [command]`).help().alias('h', 'help').demandCommand().strict().argv;