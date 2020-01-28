const { pitch } = require('.');

exports.pitch = function(req) {
	return pitch(req, true);
};
