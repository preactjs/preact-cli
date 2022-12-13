const runWebpack = require('../lib/webpack/run-webpack');
const { isPortFree, toBool, warn } = require('../util');
const getPort = require('get-port');
const { resolve } = require('path');

exports.watch = async function watchCommand(src, argv) {
	argv.src = src || argv.src;
	if (argv.sw) {
		argv.sw = toBool(argv.sw);
	}

	let cwd = resolve(argv.cwd);

	// we explicitly set the path as `dotenv` otherwise uses
	// `process.cwd()` -- this would cause issues in environments
	// like mono-repos or our test suite subjects where project root
	// and the current directory differ.
	require('dotenv').config({ path: resolve(cwd, '.env') });

	argv.https = toBool(process.env.HTTPS || argv.https);
	argv.host = process.env.HOST || argv.host;
	if (argv.host === '0.0.0.0' && process.platform === 'win32') {
		argv.host = 'localhost';
	}
	argv.port = await determinePort(argv.port);

	if (argv.https) {
		let { key, cert, cacert } = argv;
		if (key && cert) {
			argv.https = { key, cert, ca: cacert };
		} else {
			warn('Reverting to `webpack-dev-server` internal certificate.');
		}
	}

	return runWebpack(argv, false);
};

const determinePort = (exports.determinePort = async function (port) {
	port = parseInt(port, 10);
	if (port) {
		if (!(await isPortFree(port))) {
			throw new Error(
				`Another process is already running on port ${port}. Please choose a different port.`
			);
		}
	} else {
		port = await getPort({ port: parseInt(process.env.PORT, 10) || 8080 });
	}

	return port;
});
