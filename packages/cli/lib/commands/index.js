const { command: build, options: buildOptions } = require('./build');
const { command: watch, options: watchOptions } = require('./watch');

module.exports = {
	build,
	buildOptions,
	watch,
	watchOptions,
};
