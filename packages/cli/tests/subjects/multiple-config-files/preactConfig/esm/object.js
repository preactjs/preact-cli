export default {
	webpack(config, env, helpers) {
		config.output.filename = '[name].js';

		const optimizePlugin = helpers.getPluginsByName(config, 'OptimizePlugin')[0];
		if (optimizePlugin) {
			const { plugin } = optimizePlugin;
			plugin.options.downlevel = false;
			plugin.options.minify = false;
		}
	},
};
