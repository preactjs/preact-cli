const path = require('path');

module.exports = function(config) {
	const loader = path.resolve(__dirname, '../../../../async-loader/async.js');
	const alias = config.resolve.alias;
	alias['preact-cli/async-component'] = alias[
		'@preact/async-loader/async'
	] = loader;
};
