import path from 'path';

export default (config, env, helpers) => {
	const { plugin: htmlWebpackPlugin } = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0];
	htmlWebpackPlugin.options.template = `!!ejs-loader!${path.resolve(__dirname, './template.html')}`;
};
