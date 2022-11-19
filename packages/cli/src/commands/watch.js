const runWebpack = require('../lib/webpack/run-webpack');
const { isPortFree, toBool, warn } = require('../util');
const getPort = require('get-port');
const { resolve } = require('path');

exports.watch = async function watchCommand(src, argv) {
	if (argv.rhl) {
		delete argv.rhl;
		argv.refresh = argv.rhl;
	}
	argv.src = src || argv.src;
	argv.production = false;
	if (argv.sw) {
		argv.sw = toBool(argv.sw);
	}

	let cwd = resolve(argv.cwd);

	// we explicitly set the path as `dotenv` otherwise uses
	// `process.cwd()` -- this would cause issues in environments
	// like mono-repos or our test suite subjects where project root
	// and the current directory differ.
	require('dotenv').config({ path: resolve(cwd, '.env') });

	argv.port = await determinePort(argv.port);

	if (argv.https || process.env.HTTPS) {
		let { key, cert, cacert } = argv;
		if (key && cert) {
			argv.https = { key, cert, ca: cacert };
		} else {
			warn('Reverting to `webpack-dev-server` internal certificate.');
		}
	}

	return runWebpack(argv, true);
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
