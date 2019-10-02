if (typeof window !== 'undefined') {
	if (!global.fetch) global.fetch = require('isomorphic-unfetch');
}
