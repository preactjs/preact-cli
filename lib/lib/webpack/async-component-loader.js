'use strict';

var loaderUtils = require('loader-utils');

module.exports = function () {};
module.exports.pitch = function (remainingRequest) {
	this.cacheable && this.cacheable();
	var query = loaderUtils.getOptions(this) || {};
	var routeName = typeof query.name === 'function' ? query.name(this.resourcePath) : null;
	var name;
	if (routeName !== null) {
		name = routeName;
	} else if ('name' in query) {
		name = query.name;
	} else if ('formatName' in query) {
		name = query.formatName(this.resourcePath);
	}

	return `
		import Async from 'preact-cli/async-component';

		function load(cb) {
			require.ensure([], function (require) {
				cb( require(${loaderUtils.stringifyRequest(this, "!!" + remainingRequest)}) );
			}${name ? ', ' + JSON.stringify(name) : ''});
		}

		export default Async(load);
	`;
};