'use strict';

exports.__esModule = true;

let devBuild = (() => {
	var _ref = _asyncToGenerator(function* (env, onprogress) {
		let config = (0, _webpackClientConfig2.default)(env);

		yield (0, _transformConfig2.default)(env, config);

		let userPort = parseInt(process.env.PORT || config.devServer.port, 10) || 8080;
		let port = yield (0, _getPort2.default)(userPort);

		let compiler = (0, _webpack2.default)(config);
		return yield new Promise(function (_, rej) {
			compiler.plugin('emit', function (compilation, callback) {
				var missingDeps = compilation.missingDependencies;
				var nodeModulesPath = (0, _path.resolve)(__dirname, '../../../node_modules');

				if (missingDeps.some(function (file) {
					return file.indexOf(nodeModulesPath) !== -1;
				})) {
					compilation.contextDependencies.push(nodeModulesPath);
				}

				callback();
			});

			compiler.plugin('done', function (stats) {
				let devServer = config.devServer;
				let protocol = process.env.HTTPS || devServer.https ? 'https' : 'http';

				let host = process.env.HOST || devServer.host || 'localhost';
				if (host === '0.0.0.0') host = 'localhost';

				let serverAddr = `${protocol}://${host}:${_chalk2.default.bold(port)}`;
				let localIpAddr = `${protocol}://${_ip2.default.address()}:${_chalk2.default.bold(port)}`;

				(0, _consoleClear2.default)();

				if (stats.hasErrors()) {
					process.stdout.write(_chalk2.default.red('\Build failed!\n\n'));
				} else {
					process.stdout.write(_chalk2.default.green('Compiled successfully!\n\n'));

					if (userPort !== port) {
						process.stdout.write(`Port ${_chalk2.default.bold(userPort)} is in use, using ${_chalk2.default.bold(port)} instead\n\n`);
					}
					process.stdout.write('You can view the application in browser.\n\n');
					process.stdout.write(`${_chalk2.default.bold('Local:')}            ${serverAddr}\n`);
					process.stdout.write(`${_chalk2.default.bold('On Your Network:')}  ${localIpAddr}\n`);
				}

				if (onprogress) onprogress(stats);
			});

			compiler.plugin('failed', rej);

			new _webpackDevServer2.default(compiler, config.devServer).listen(port);
		});
	});

	return function devBuild(_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

let prodBuild = (() => {
	var _ref2 = _asyncToGenerator(function* (env) {
		let config = (0, _webpackClientConfig2.default)(env);

		yield (0, _transformConfig2.default)(env, config);
		let serverCompiler,
		    clientCompiler = (0, _webpack2.default)(config);

		if (env.prerender) {
			let ssrConfig = (0, _webpackServerConfig2.default)(env);
			yield (0, _transformConfig2.default)(env, ssrConfig, true);
			serverCompiler = (0, _webpack2.default)(ssrConfig);
			yield runCompiler(serverCompiler);
		}

		let stats = yield runCompiler(clientCompiler);

		yield new Promise(function (r) {
			return setTimeout(r, 20);
		});

		return stats;
	});

	return function prodBuild(_x3) {
		return _ref2.apply(this, arguments);
	};
})();

exports.default = function (watch = false, env, onprogress) {
	env.isProd = env.production;
	env.isWatch = !!watch;
	env.cwd = (0, _path.resolve)(env.cwd || process.cwd());

	let src = (0, _path.resolve)(env.cwd, env.src);
	env.src = (0, _util.isDir)(src) ? src : env.cwd;

	env.source = dir => (0, _path.resolve)(env.src, dir);

	let fn = watch ? devBuild : prodBuild;
	return fn(env, onprogress);
};

exports.showStats = showStats;
exports.writeJsonStats = writeJsonStats;

var _ip = require('ip');

var _ip2 = _interopRequireDefault(_ip);

var _path = require('path');

var _fs = require('fs.promised');

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _getPort = require('get-port');

var _getPort2 = _interopRequireDefault(_getPort);

var _consoleClear = require('console-clear');

var _consoleClear2 = _interopRequireDefault(_consoleClear);

var _webpackDevServer = require('webpack-dev-server');

var _webpackDevServer2 = _interopRequireDefault(_webpackDevServer);

var _webpackClientConfig = require('./webpack-client-config');

var _webpackClientConfig2 = _interopRequireDefault(_webpackClientConfig);

var _webpackServerConfig = require('./webpack-server-config');

var _webpackServerConfig2 = _interopRequireDefault(_webpackServerConfig);

var _transformConfig = require('./transform-config');

var _transformConfig2 = _interopRequireDefault(_transformConfig);

var _util = require('../../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const runCompiler = compiler => new Promise((res, rej) => {
	compiler.run((err, stats) => {
		if (stats && stats.hasErrors()) {
			showStats(stats);
		}

		if (err || stats && stats.hasErrors()) {
			rej(_chalk2.default.red('Build failed! ' + err));
		}

		res(stats);
	});
});

function showStats(stats) {
	let info = stats.toJson('errors-only');

	if (stats.hasErrors()) {
		info.errors.map(stripLoaderPrefix).forEach(msg => (0, _util.error)(msg));
	}

	if (stats.hasWarnings()) {
		info.warnings.map(stripLoaderPrefix).forEach(msg => (0, _util.warn)(msg));
	}

	return stats;
}

function writeJsonStats(stats) {
	let outputPath = (0, _path.resolve)(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({ json: true, chunkModules: true, source: false });

	function strip(stats) {
		stats.modules.forEach(stripLoaderFromModuleNames);
		stats.chunks.forEach(c => {
			(c.modules || (c.mapModules != null ? c.mapModules(Object) : c.getModules())).forEach(stripLoaderFromModuleNames);
		});
		if (stats.children) stats.children.forEach(strip);
	}

	strip(jsonStats);

	return (0, _fs.writeFile)(outputPath, JSON.stringify(jsonStats)).then(() => {
		process.stdout.write('\nWebpack output stats generated.\n\n');
		process.stdout.write('You can upload your stats.json to:\n');
		process.stdout.write('- https://chrisbateman.github.io/webpack-visualizer/\n');
		process.stdout.write('- https://webpack.github.io/analyse/\n');
	});
}

const keysToNormalize = ['issuer', 'issuerName', 'identifier', 'name', 'module', 'moduleName', 'moduleIdentifier'];

function stripLoaderPrefix(str) {
	if (typeof str === 'string') {
		return str.replace(/(^|\b|@)(\.\/~|\.{0,2}\/[^\s]+\/node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g, '');
	}
	return str;
}

function stripLoaderFromModuleNames(m) {
	for (let key in m) {
		if (m.hasOwnProperty(key) && m[key] != null && ~keysToNormalize.indexOf(key)) {
			m[key] = stripLoaderPrefix(m[key]);
		}
	}

	if (m.reasons) {
		m.reasons.forEach(stripLoaderFromModuleNames);
	}

	return m;
}