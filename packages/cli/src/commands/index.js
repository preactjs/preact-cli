const { command: build, options: buildOptions } = require('./build');
const { command: create, options: createOptions } = require('./create');
const list = require('./list');
const { command: watch, options: watchOptions } = require('./watch');

module.exports = {
	build,
	buildOptions,
	create,
	createOptions,
	list,
	watch,
	watchOptions,
};
