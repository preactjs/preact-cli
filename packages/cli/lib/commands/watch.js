const rimraf = require('rimraf');
const { resolve } = require('path');
const { promisify } = require('util');
const { warn } = require('../util');
const runWebpack = require('../lib/webpack/run-webpack');

const toBool = (val) => val === void 0 || (val === 'false' ? false : val);

module.exports = async function (src, argv) {
	if (argv.rhl) {
		delete argv.rhl;
		argv.refresh = argv.rhl;
	}

	argv.src = src || argv.src;
	argv.production = false;
	argv.devServer = toBool(argv.devServer);
	if (!argv.devServer) argv.prerender = true;

	if (argv.https || process.env.HTTPS) {
		let { key, cert, cacert } = argv;
		if (key && cert) {
			argv.https = { key, cert, ca: cacert };
		} else {
			warn('Reverting to `webpack-dev-server` internal certificate.');
		}
	}

	if (argv.clean === void 0) {
		let dest = resolve(argv.cwd, argv.dest);
		await promisify(rimraf)(dest);
	}

	return runWebpack(argv, true);
};
