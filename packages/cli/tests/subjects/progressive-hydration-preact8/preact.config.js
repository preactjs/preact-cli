const path = require('path');

module.exports = function (config) {
	const modules = config.resolve.modules;
	if (modules[0] === 'node_modules') {
		modules.splice(0, 1);
		modules.push('node_modules');
	}

	const loader = path.resolve(
		__dirname,
		'../../../../async-loader/async-legacy.js'
	);
	const alias = config.resolve.alias;
	alias['preact-cli/async-component'] = alias['@preact/async-loader/async'] =
		loader;

	for (const rule of config.module.rules) {
		if (/async-loader/.test(rule.loader)) {
			rule.loader = path.resolve(__dirname, '../../../../async-loader/legacy');
		}
	}
};
