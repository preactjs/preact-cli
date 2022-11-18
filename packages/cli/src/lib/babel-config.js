const { tryResolveConfig } = require('../util');

/**
 * @param {boolean} isProd
 */
module.exports = function (config, isProd) {
	const { babelConfig, cwd, refresh } = config;

	const resolvedConfig =
		babelConfig &&
		tryResolveConfig(cwd, babelConfig, babelConfig === '.babelrc');

	return {
		babelrc: false,
		configFile: resolvedConfig,
		presets: [
			!isProd && [
				require.resolve('@babel/preset-env'),
				{
					loose: true,
					modules: false,
					bugfixes: true,
					targets: {
						esmodules: true,
					},
					exclude: ['transform-regenerator'],
				},
			],
		].filter(Boolean),
		plugins: [
			[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
			isProd &&
				require.resolve('babel-plugin-transform-react-remove-prop-types'),
			require.resolve('babel-plugin-macros'),
			[
				require.resolve('@babel/plugin-transform-react-jsx'),
				{ runtime: 'automatic', importSource: 'preact' },
			],
		].filter(Boolean),
		overrides: [
			// Transforms to apply only to first-party code:
			{
				exclude: '**/node_modules/**',
				presets: [require.resolve('@babel/preset-typescript')],
				plugins: [
					!isProd && refresh && require.resolve('react-refresh/babel'),
				].filter(Boolean),
			},
		],
	};
};
