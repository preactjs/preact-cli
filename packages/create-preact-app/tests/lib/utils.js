/* eslint-disable no-console */
const { resolve } = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob').glob);

// `node-glob` ignore pattern buggy?
const ignores = (x) => !/node_modules|package-lock|yarn.lock/i.test(x);

function expand(dir, opts) {
	dir = resolve(dir);
	opts = Object.assign({ dot: true, nodir: true }, opts);
	return glob(`${dir}/**/*.*`, opts).then((arr) => arr.filter(ignores));
}

module.exports = {
	expand,
};
