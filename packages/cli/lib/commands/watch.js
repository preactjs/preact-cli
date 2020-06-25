const runWebpack = require('../lib/webpack/run-webpack');
const { warn } = require('../util');

const toBool = (val) => val === void 0 || (val === 'false' ? false : val);

module.exports = async function (src, argv) {
	if (argv.rhl) {
		delete argv.rhl;
		argv.refresh = argv.rhl;
	}

	argv.prerender = toBool(argv.prerender);
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
