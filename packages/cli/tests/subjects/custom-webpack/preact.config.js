const path = require('path');

module.exports = function (config, env, helpers) {
	if (env.ssr) return;
	helpers.setHtmlTemplate(config, path.resolve(__dirname, './template.html'));
};
