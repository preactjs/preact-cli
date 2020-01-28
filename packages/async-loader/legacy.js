const { pitch } = require('.');
const { info } = require('./utils');

info('Detected Preact 8, Loading legacy async-component');

exports.pitch = function(req) {
	return pitch(req, true);
};
