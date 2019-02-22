'use strict';

exports.__esModule = true;

var _rimraf = require('rimraf');

var _rimraf2 = _interopRequireDefault(_rimraf);

var _path = require('path');

var _util = require('../util');

var _asyncCommand = require('../lib/async-command');

var _asyncCommand2 = _interopRequireDefault(_asyncCommand);

var _runWebpack = require('../lib/webpack/run-webpack');

var _runWebpack2 = _interopRequireDefault(_runWebpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const toBool = val => val === void 0 || (val === 'false' ? false : val);

exports.default = (0, _asyncCommand2.default)({
	command: 'build [src] [dest]',

	desc: 'Create a production build in build/',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
		src: {
			description: 'Entry file (index.js)',
			default: 'src'
		},
		dest: {
			description: 'Directory root for output',
			default: 'build'
		},
		production: {
			description: 'Create a minified production build.',
			alias: 'p',
			default: true
		},
		prerender: {
			description: 'Pre-render static app content.',
			default: true
		},
		prerenderUrls: {
			description: 'Path to pre-render routes configuration.',
			default: 'prerender-urls.json'
		},
		'service-worker': {
			description: 'Add a service worker to the application.',
			default: true
		},
		clean: {
			description: 'Clear output directory before building.',
			default: true
		},
		json: {
			description: 'Generate build statistics for analysis.',
			default: false
		},
		template: {
			description: 'HTML template used by webpack'
		},
		config: {
			description: 'Path to custom CLI config.',
			alias: 'c'
		}
	},

	handler(argv) {
		return _asyncToGenerator(function* () {
			let cwd = (0, _path.resolve)(argv.cwd);
			let modules = (0, _path.resolve)(cwd, 'node_modules');

			argv.prerender = toBool(argv.prerender);
			argv.production = toBool(argv.production);

			if (!(0, _util.isDir)(modules)) {
				return (0, _util.error)('No `node_modules` found! Please run `npm install` before continuing.', 1);
			}

			if (argv.clean) {
				let dest = (0, _path.resolve)(cwd, argv.dest || 'build');
				yield Promise.promisify(_rimraf2.default)(dest);
			}

			let stats = yield (0, _runWebpack2.default)(false, argv);

			(0, _runWebpack.showStats)(stats);

			if (argv.json) {
				yield (0, _runWebpack.writeJsonStats)(stats);
			}
		})();
	}
});