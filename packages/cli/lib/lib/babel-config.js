const { tryResolveConfig } = require('../util');

module.exports = function (env) {
	const { babelConfig, cwd, isProd, refresh } = env;

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
				{ pragma: 'h', pragmaFrag: 'Fragment' },
			],
		].filter(Boolean),
		overrides: [
			// Transforms to apply only to first-party code:
			{
				exclude: '**/node_modules/**',
				presets: [
					[require.resolve('@babel/preset-typescript'), { jsxPragma: 'h' }],
				],
				plugins: [
					!isProd && refresh && require.resolve('react-refresh/babel'),
				].filter(Boolean),
			},
		],
	};
};
