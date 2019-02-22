'use strict';

exports.__esModule = true;

var _isomorphicUnfetch = require('isomorphic-unfetch');

var _isomorphicUnfetch2 = _interopRequireDefault(_isomorphicUnfetch);

var _chalk = require('chalk');

var _util = require('../util');

var _asyncCommand = require('../lib/async-command');

var _asyncCommand2 = _interopRequireDefault(_asyncCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const REPOS_URL = "https://api.github.com/users/preactjs-templates/repos";

exports.default = (0, _asyncCommand2.default)({
	command: 'list',

	desc: 'List all official templates',

	handler() {
		return _asyncToGenerator(function* () {
			try {
				let repos = yield (0, _isomorphicUnfetch2.default)(REPOS_URL).then(function (r) {
					return r.json();
				});

				process.stdout.write('\n');
				(0, _util.info)('Available official templates: \n');

				repos.map(function (repo) {
					process.stdout.write(`  ⭐️  ${(0, _chalk.bold)((0, _chalk.magenta)(repo.name))} - ${repo.description} \n`);
				});

				process.stdout.write('\n');
			} catch (err) {
				(0, _util.error)(err, 1);
			}
		})();
	}
});