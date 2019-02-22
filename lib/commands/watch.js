'use strict';

exports.__esModule = true;

var _sslCert = require('../lib/ssl-cert');

var _sslCert2 = _interopRequireDefault(_sslCert);

var _asyncCommand = require('../lib/async-command');

var _asyncCommand2 = _interopRequireDefault(_asyncCommand);

var _runWebpack = require('../lib/webpack/run-webpack');

var _runWebpack2 = _interopRequireDefault(_runWebpack);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (0, _asyncCommand2.default)({
	command: 'watch [src]',

	desc: 'Start a development live-reload server.',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
		src: {
			description: 'Entry file (index.js)',
			default: 'src'
		},
		port: {
			description: 'Port to start a server on',
			default: '8080',
			alias: 'p'
		},
		host: {
			description: 'Hostname to start a server on',
			default: '0.0.0.0',
			alias: 'H'
		},
		https: {
			description: 'Use HTTPS?',
			type: 'boolean',
			default: false
		},
		prerender: {
			description: 'Pre-render static app content on initial build',
			default: false
		},
		template: {
			description: 'HTML template used by webpack'
		},
		config: {
			description: 'Path to custom preact.config.js',
			alias: 'c'
		}
	},

	handler(argv) {
		return _asyncToGenerator(function* () {
			argv.production = false;

			if (argv.https || process.env.HTTPS) {
				let ssl = yield (0, _sslCert2.default)();
				if (!ssl) {
					ssl = true;
					(0, _util.warn)('Reverting to `webpack-dev-server` internal certificate.');
				}
				argv.https = ssl;
			}

			let stats = yield (0, _runWebpack2.default)(true, argv, _runWebpack.showStats);
			(0, _runWebpack.showStats)(stats);
		})();
	}
});