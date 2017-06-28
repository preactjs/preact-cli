import path from 'path';

export default (config, env, helpers) => {
	let htmlWebpackPluginWrapper = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0];

	if (htmlWebpackPluginWrapper && htmlWebpackPluginWrapper.plugin) {
		let { options } = htmlWebpackPluginWrapper.plugin;
		options.template = `!!ejs-loader!${path.resolve(__dirname, './template.html')}`;
	}
};
