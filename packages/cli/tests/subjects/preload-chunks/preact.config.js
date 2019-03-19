module.exports = config => {
	config.optimization.splitChunks = {
		minSize: 0,
	};
	return config;
};
