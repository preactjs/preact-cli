const { blue } = require('kleur');

exports.info = function(text, code) {
	process.stderr.write('\n' + blue('ℹ INFO: ⚛️ ') + text + '\n');
	code && process.exit(code);
};
