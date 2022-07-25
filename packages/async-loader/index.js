const path = require('path');

exports.pitch = function (req) {
	this.cacheable && this.cacheable();
	let name;
	let query = this.getOptions() || {};
	let routeName =
		typeof query.name === 'function' ? query.name(this.resourcePath) : null;

	if (routeName !== null) {
		name = routeName;
	} else if ('name' in query) {
		name = query.name;
	} else if ('formatName' in query) {
		name = query.formatName(this.resourcePath);
	}

	// import Async from '${path.relative(process.cwd(), path.resolve(__dirname, 'async-component.js'))}';
	return `
		import Async from ${JSON.stringify(
			this.utils.contextify(this.context, path.resolve(__dirname, 'async.js'))
		)};

		function load(cb) {
			require.ensure([], function (require) {
				var result = require(${JSON.stringify(
					this.utils.contextify(this.context, '!!' + req)
				)});
				typeof cb === 'function' && cb(result);
			}${name ? ', ' + JSON.stringify(name) : ''});
		}

		export default Async(load);
	`;
};
