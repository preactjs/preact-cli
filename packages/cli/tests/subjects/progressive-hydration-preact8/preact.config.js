const path = require('path');

module.exports = function(config) {
	const loader = path.resolve(
		__dirname,
		'../../../../async-loader/async-legacy.js'
	);
	const alias = config.resolve.alias;
	alias['preact-cli/async-component'] = alias[
		'@preact/async-loader/async'
	] = loader;

	for (const rule of config.module.rules) {
		if (/async-loader/.test(rule.loader)) {
			rule.loader = path.resolve(__dirname, '../../../../async-loader/legacy');
		}
	}
};
