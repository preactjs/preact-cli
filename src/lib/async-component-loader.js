var loaderUtils = require('loader-utils'),
	path = require('path');

module.exports = function() {};
module.exports.pitch = function(remainingRequest) {
	this.cacheable && this.cacheable();
	var query = loaderUtils.getOptions(this) || {};
	var routeName = typeof query.name === 'function' ? query.name(this.resourcePath) : null;
	var name = routeName !== null ? routeName : ('name' in query ? query.name : (query.formatName || String)(this.resourcePath));

	return `
		import async from ${JSON.stringify(path.resolve(__dirname, '../components/async'))};

		function load(cb) {
			require.ensure([], function(require) {
				cb(require(${ loaderUtils.stringifyRequest(this, "!!" + remainingRequest) }));
			}${name ? (', '+JSON.stringify(name)) : ''});
		}

		export default async(load);
	`;
};
