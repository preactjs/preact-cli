const createConfig = require('preact-cli/lib/lib/babel-config');
const babelJest = require('babel-jest');

const config = createConfig(
	{ production: false },
	{ modules: 'commonjs', browsers: 'maintained node versions' }
);

module.exports = babelJest.createTransformer({
	plugins: config.plugins,
	presets: config.presets,
	babelrc: false,
	configFile: false,
});
