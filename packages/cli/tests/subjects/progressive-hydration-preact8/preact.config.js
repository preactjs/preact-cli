module.exports = function (config) {
	const modules = config.resolve.modules;
	if (modules[0] === 'node_modules') {
		modules.splice(0, 1);
		modules.push('node_modules');
	}
};
