module.exports = function (config, env, helpers) {
	if (env.isProd) {
		config.output.filename = '[name].js';
	} else {
		config.output.filename = (pathData) =>
			pathData.chunk.name == 'dom-polyfills'
				? '[name].legacy.js'
				: 'renamed-bundle.js';
	}
};
