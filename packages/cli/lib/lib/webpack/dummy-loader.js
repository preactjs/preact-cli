const { stringifyRequest } = require('loader-utils');

exports.pitch = function(req) {
	return `
		import Sync from '@preact/async-loader/sync';
		function load(cb) {
			cb( require(${stringifyRequest(this, '!!' + req)}) );
		}
		export default Sync(load);
	`;
};
