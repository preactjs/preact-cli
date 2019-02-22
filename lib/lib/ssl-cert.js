'use strict';

exports.__esModule = true;

var _devcertSan = require('devcert-san');

var _devcertSan2 = _interopRequireDefault(_devcertSan);

var _persistPath = require('persist-path');

var _persistPath2 = _interopRequireDefault(_persistPath);

var _simplehttp2server = require('simplehttp2server');

var _simplehttp2server2 = _interopRequireDefault(_simplehttp2server);

var _fs = require('fs.promised');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* () {
		process.stdout.write('Setting up SSL certificate (may require sudo)...\n');
		try {
			return yield (0, _devcertSan2.default)('preact-cli', {
				installCertutil: true
			});
		} catch (err) {
			process.stderr.write('Attempting to spawn simplehttp2server to generate cert.\n');
			try {
				return yield spawnServerForCert();
			} catch (err) {
				process.stderr.write(`Failed to generate dev SSL certificate: ${err}\n`);
			}
		}
		return false;
	});

	function getSslCert() {
		return _ref.apply(this, arguments);
	}

	return getSslCert;
})();

const spawnServerForCert = () => new Promise((resolve, reject) => {
	let cwd = (0, _persistPath2.default)('preact-cli');
	let child = (0, _child_process.execFile)(_simplehttp2server2.default, ['-listen', ':40210'], {
		cwd,
		encoding: 'utf8'
	}, (err, stdout, stderr) => {
		let check = (() => {
			var _ref2 = _asyncToGenerator(function* (chunk) {
				if (/listening/gi.match(chunk)) {
					clearTimeout(timer);
					child.kill();
					resolve({
						key: yield _fs2.default.readFile(_path2.default.resolve(cwd, 'key.pem'), 'utf-8'),
						cert: yield _fs2.default.readFile(_path2.default.resolve(cwd, 'cert.pem'), 'utf-8'),
						keyPath: _path2.default.resolve(cwd, 'key.pem'),
						certPath: _path2.default.resolve(cwd, 'cert.pem')
					});
				}
			});

			return function check(_x) {
				return _ref2.apply(this, arguments);
			};
		})();

		if (err) return reject(err);
		let timer = setTimeout(() => {
			reject('Error: certificate generation timed out.');
		}, 5000);

		stdout.on('data', check);
		stderr.on('data', check);
	});
});