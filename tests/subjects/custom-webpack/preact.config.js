import path from 'path';

export default (config, env, helpers) => {
	if (env.ssr) return;
	let { plugin } = helpers.getPluginsByName(config, 'HtmlWebpackPlugin')[0];
	plugin.options.template = `!!ejs-loader!${path.resolve(__dirname, './template.html')}`;
};
