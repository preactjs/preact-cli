'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = asyncCommand;
function done(err, result) {
	if (err) {
		process.stderr.write(String(err) + '\n');
		process.exit(err.exitCode || 1);
	} else {
		if (result) process.stdout.write(result + '\n');
		process.exit(0);
	}
}

function asyncCommand(options) {
	return _extends({}, options, {
		handler(argv) {
			let r = options.handler(argv, done);
			if (r && r.then) r.then(result => done(null, result), done);
		}
	});
}