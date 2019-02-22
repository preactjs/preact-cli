'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

let serve = (() => {
	var _ref = _asyncToGenerator(function* (options) {
		let dir = _path2.default.resolve(options.cwd, options.dir || '.');

		let configFile = options.config ? options.config : _path2.default.resolve(__dirname, '../resources/static-app.json');
		let config = yield readJson(configFile);

		config.public = dir;

		let pushManifest = yield readJson(_path2.default.resolve(dir, 'push-manifest.json'));
		if (pushManifest) {
			config.headers = [].concat(config.headers || [], createHeadersFromPushManifest(pushManifest));
		}

		configFile = yield tmpFile({ postfix: '.json' });
		yield _fs2.default.writeFile(configFile, JSON.stringify(config));

		let port = options.port || process.env.PORT || 8080;

		yield serveHttp2({
			options,
			config: configFile,
			configObj: config,
			server: options.server,
			cors: options.cors || `https://localhost:${port}`,
			port,
			dir,
			cwd: _path2.default.resolve(__dirname, '../resources')
		});
	});

	return function serve(_x) {
		return _ref.apply(this, arguments);
	};
})();

let readJson = (() => {
	var _ref2 = _asyncToGenerator(function* (filename) {
		try {
			return JSON.parse((yield _fs2.default.readFile(filename, 'utf8')));
		} catch (e) {}
	});

	return function readJson(_x2) {
		return _ref2.apply(this, arguments);
	};
})();

var _asyncCommand = require('../lib/async-command');

var _asyncCommand2 = _interopRequireDefault(_asyncCommand);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs.promised');

var _fs2 = _interopRequireDefault(_fs);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _child_process = require('child_process');

var _sslCert = require('../lib/ssl-cert');

var _sslCert2 = _interopRequireDefault(_sslCert);

var _persistPath = require('persist-path');

var _persistPath2 = _interopRequireDefault(_persistPath);

var _simplehttp2server = require('simplehttp2server');

var _simplehttp2server2 = _interopRequireDefault(_simplehttp2server);

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (0, _asyncCommand2.default)({
	command: 'serve [dir]',

	desc: 'Start an HTTP2 static fileserver.',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
		dir: {
			description: 'Directory root to serve static files from.',
			default: 'build'
		},
		server: {
			description: 'Which server to run, or "config" to produce a firebase config.',
			choices: ['simplehttp2server', 'superstatic', 'config'],
			default: 'simplehttp2server'
		},
		dest: {
			description: 'Directory or filename where firebase.json should be written\n  (used for --server config)',
			defaultDescription: '-'
		},
		port: {
			description: 'Port to start a server on.',
			defaultDescription: 'PORT || 8080',
			alias: 'p'
		},
		cors: {
			description: 'Set allowed origins',
			defaultDescription: 'https://localhost:${PORT}'
		}
	},

	handler(argv) {
		return _asyncToGenerator(function* () {
			yield serve(argv);
		})();
	}
});

function createHeadersFromPushManifest(pushManifest) {
	let headers = [];

	for (let source in pushManifest) {
		if (pushManifest.hasOwnProperty(source)) {
			let section = pushManifest[source],
			    links = [];

			for (let file in section) {
				if (section.hasOwnProperty(file)) {
					links.push(_extends({
						url: '/' + file.replace(/^\//g, '')
					}, section[file]));
				}
			}

			links = links.sort((a, b) => {
				let diff = b.weight - a.weight;
				if (!diff) {
					if (b.url.match(/bundle\.js$/)) return 1;
					return b.url.match(/\.js$/) ? 1 : 0;
				}
				return diff;
			});

			headers.push({
				source,
				headers: [{
					key: 'Link',
					value: links.map(({ url, type }) => `<${url}>; rel=preload; as=${type}`).join(', ')
				}]
			});
		}
	}

	return headers;
}

const serveHttp2 = options => Promise.resolve(options).then(SERVERS[options.server || 'simplehttp2server']).then(args => new Promise((resolve, reject) => {
	if (typeof args === 'string') {
		process.stdout.write(args + '\n');
		return resolve();
	}

	let child = (0, _child_process.execFile)(args[0], args.slice(1), {
		cwd: options.cwd,
		encoding: 'utf8'
	}, (err, stdout, stderr) => {
		if (err) process.stderr.write('\n  server error> ' + err + '\n' + stderr);else process.stdout.write('\n  server spawned> ' + stdout);

		if (err) return reject(err + '\n' + stderr);else resolve();
	});

	function proxy(type) {
		child[type].on('data', data => {
			data = data.replace(/^(\s*\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})?\s*/gm, '');
			if (data.match(/\bRequest for\b/gim)) return;
			process[type].write(`  \u001b[32m${data}\u001b[39m`);
		});
	}
	proxy('stdout');
	proxy('stderr');
	process.stdin.pipe(child.stdin);
}));

const SERVERS = {
	simplehttp2server(options) {
		return _asyncToGenerator(function* () {
			let ssl = yield (0, _sslCert2.default)();
			if (ssl) {
				yield _fs2.default.writeFile(_path2.default.resolve(options.cwd, 'key.pem'), ssl.key);
				yield _fs2.default.writeFile(_path2.default.resolve(options.cwd, 'cert.pem'), ssl.cert);
			} else {
				options.cwd = (0, _persistPath2.default)('preact-cli');
				process.stderr.write(`Falling back to shared directory + simplehttp2server.\n(dir: ${options.cwd})\n`);
			}

			return [_simplehttp2server2.default, '-cors', options.cors, '-config', options.config, '-listen', `:${options.port}`];
		})();
	},
	superstatic(options) {
		return ['superstatic', _path2.default.relative(options.cwd, options.dir), '--gzip', '-p', options.port, '-c', JSON.stringify(_extends({}, options.configObj, { public: undefined }))];
	},

	config({ configObj, options }) {
		return _asyncToGenerator(function* () {
			let dir = process.cwd(),
			    outfile;
			if (options.dest && options.dest !== '-') {
				if ((0, _util.isDir)(options.dest)) {
					dir = options.dest;
					outfile = 'firebase.json';
				} else {
					dir = _path2.default.dirname(options.dest);
					outfile = _path2.default.basename(options.dest);
				}
			}

			let config = yield readJson(_path2.default.resolve(dir, outfile));
			config = Object.assign({}, config, {
				hosting: _extends({}, configObj, {
					public: _path2.default.relative(dir, configObj.public)
				})
			});
			config = JSON.stringify(config, null, 2);

			if (outfile) {
				yield _fs2.default.writeFile(_path2.default.resolve(dir, outfile), config);
				return `Configuration written to ${outfile}.`;
			} else {
				return config;
			}
		})();
	}
};

const tmpFile = opts => new Promise((res, rej) => {
	_tmp2.default.file(opts, (err, path) => err ? rej(err) : res(path));
});