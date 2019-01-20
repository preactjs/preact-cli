module.exports = function(env, options = {}) {
	const isProd = env && env.production;

	return {
		presets: [
			[
				require.resolve('@babel/preset-env'),
				{
					loose: true,
					modules: options.modules || false,
					targets: {
						browsers: options.browsers,
					},
					exclude: ['transform-regenerator', 'transform-async-to-generator'],
				},
			],
		],
		plugins: [
			require.resolve('@babel/plugin-syntax-dynamic-import'),
			require.resolve('@babel/plugin-transform-object-assign'),
			[require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
			require.resolve('@babel/plugin-proposal-class-properties'),
			require.resolve('@babel/plugin-proposal-object-rest-spread'),
			require.resolve('@babel/plugin-transform-react-constant-elements'),
			isProd &&
				require.resolve('babel-plugin-transform-react-remove-prop-types'),
			[require.resolve('@babel/plugin-transform-react-jsx'), { pragma: 'h' }],
			[require.resolve('fast-async'), { spec: true }],
			require.resolve('babel-plugin-macros'),
			!isProd &&
				require.resolve('react-hot-loader/babel'),
		].filter(Boolean),
	};
};
