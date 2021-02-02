const { error } = require('../util');

function validateArgs(argv, options, command) {
	let normalizedOptions = options
		.map(option => option.name.split(','))
		.reduce((acc, val) => acc.concat(val), []);
	normalizedOptions = normalizedOptions.map(option => {
		option = option.trim();
		if (option.startsWith('--')) {
			return option.substr(2);
		} else if (option.startsWith('-')) {
			return option.substr(1);
		}
	});
	for (const arg in argv) {
		if (arg === '_') {
			// ignore this arg
			continue;
		}
		if (!normalizedOptions.includes(arg)) {
			error(
				`Invalid argument ${arg} passed to ${command}. Please refer to 'preact ${command} --help' for full list of options.\n\n`
			);
			throw new Error('Invalid argument found.');
		}
	}
}

module.exports = {
	validateArgs,
};
