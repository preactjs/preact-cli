'use strict';

exports.__esModule = true;
exports.initGit = exports.addScripts = undefined;

let addScripts = exports.addScripts = (() => {
	var _ref = _asyncToGenerator(function* (obj, cwd, isYarn) {
		let cmd = isYarn ? 'yarn' : 'npm';
		let args = isYarn ? ['add', '--dev'] : ['install', '--save-dev'];

		yield (0, _crossSpawnPromise2.default)(cmd, [...args, 'if-env'], { cwd, stdio: 'ignore ' });

		return {
			build: 'preact build',
			serve: 'preact build && preact serve',
			start: `if-env NODE_ENV=production && ${cmd} run -s serve || ${cmd} run -s watch`,
			watch: 'preact watch'
		};
	});

	return function addScripts(_x, _x2, _x3) {
		return _ref.apply(this, arguments);
	};
})();

let initGit = exports.initGit = (() => {
	var _ref2 = _asyncToGenerator(function* (target) {
		let git = (0, _util.hasCommand)('git');

		if (git) {
			const cwd = target;

			yield (0, _crossSpawnPromise2.default)('git', ['init'], { cwd });
			yield (0, _crossSpawnPromise2.default)('git', ['add', '-A'], { cwd });

			let gitUser, gitEmail;
			const defaultGitUser = 'Preact CLI';
			const defaultGitEmail = 'preact-cli@users.noreply.github.com';

			try {
				gitEmail = (yield (0, _crossSpawnPromise2.default)('git', ['config', 'user.email'])).toString();
			} catch (e) {
				gitEmail = defaultGitEmail;
			}

			try {
				gitUser = (yield (0, _crossSpawnPromise2.default)('git', ['config', 'user.name'])).toString();
			} catch (e) {
				gitUser = defaultGitUser;
			}

			yield (0, _crossSpawnPromise2.default)('git', ['commit', '-m', 'initial commit from Preact CLI'], {
				cwd,
				env: {
					GIT_COMMITTER_NAME: gitUser,
					GIT_COMMITTER_EMAIL: gitEmail,
					GIT_AUTHOR_NAME: defaultGitUser,
					GIT_AUTHOR_EMAIL: defaultGitEmail
				}
			});
		} else {
			(0, _util.warn)('Could not locate `git` binary in `$PATH`. Skipping!');
		}
	});

	return function initGit(_x4) {
		return _ref2.apply(this, arguments);
	};
})();

exports.install = install;
exports.isMissing = isMissing;

var _crossSpawnPromise = require('cross-spawn-promise');

var _crossSpawnPromise2 = _interopRequireDefault(_crossSpawnPromise);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function install(cwd, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm';
	return (0, _crossSpawnPromise2.default)(cmd, ['install'], { cwd, stdio: 'ignore' });
}

function isMissing(argv) {
	let out = [];

	const ask = (name, message, val) => {
		let type = val === void 0 ? 'input' : 'confirm';
		out.push({ name, message, type, default: val });
	};

	!argv.template && ask('template', 'Remote template to clone (user/repo#tag)');
	!argv.dest && ask('dest', 'Directory to create the app');

	!argv.name && ask('name', 'The application\'s name');
	!argv.force && ask('force', 'Enforce `dest` directory; will overwrite!', false);
	ask('install', 'Install dependencies', true);
	!argv.yarn && ask('yarn', 'Install with `yarn` instead of `npm`', false);
	!argv.git && ask('git', 'Initialize a `git` repository', false);

	return out;
}