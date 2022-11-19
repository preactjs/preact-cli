module.exports = function (config, env) {
	if (env.isProd) {
		config.output.filename = '[name].js';
	} else {
		config.output.filename = 'renamed-bundle.js';
	}
};
