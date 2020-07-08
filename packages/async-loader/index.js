const path = require('path');
const { getOptions, stringifyRequest } = require('loader-utils');
const PREACT_LEGACY_MODE = 'PREACT_LEGACY_MODE';

exports.pitch = function (req, mode) {
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

	// import Async from '${path.relative(process.cwd(), path.resolve(__dirname, 'async-component.js'))}';
	return `
		import Async from ${stringifyRequest(
			this,
			path.resolve(
				__dirname,
				mode === PREACT_LEGACY_MODE ? 'async-legacy.js' : 'async.js'
			) // explicit value check because webpack sends 2nd argument values but we dont use it
		)};

		function load(cb) {
			require.ensure([], function (require) {
				var result = require(${stringifyRequest(this, '!!' + req)});
				typeof cb === 'function' && cb(result);
			}${name ? ', ' + JSON.stringify(name) : ''});
		}

		export default Async(load);
	`;
};

exports.PREACT_LEGACY_MODE = PREACT_LEGACY_MODE;
