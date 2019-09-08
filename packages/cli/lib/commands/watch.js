const runWebpack = require('../lib/webpack/run-webpack');
const { warn } = require('../util');

module.exports = async function(src, argv) {
	argv.src = src || argv.src;
	argv.production = false;

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
