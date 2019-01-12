const { getOptions, stringifyRequest } = require('loader-utils');

exports.pitch = function(req) {
	this.cacheable && this.cacheable();

	let name;
	let query = getOptions(this) || {};
	let routeName =
		typeof query.name === 'function' ? query.name(this.resourcePath) : null;

	if (routeName !== null) {
		name = routeName;
	} else if ('name' in query) {
		name = query.name;
	} else if ('formatName' in query) {
		name = query.formatName(this.resourcePath);
	}

	return `
		import Async from '@preact/async-loader/async';

		function load(cb) {
			require.ensure([], function (require) {
				cb( require(${stringifyRequest(this, '!!' + req)}) );
			}${name ? ', ' + JSON.stringify(name) : ''});
		}

		export default Async(load);
	`;
};
