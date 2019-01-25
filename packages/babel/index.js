const ENV = process.env.BABEL_ENV || process.env.NODE_ENV;

// @see https://jamie.build/last-2-versions
const browsers = [
	'>0.25%',
	'not ie 11',
	'not op_mini all'
];

module.exports = function(env, options = {}) {
	const isProd = env && env.production || ENV === 'production';

	if (ENV === 'test') {
		options.modules = 'commonjs';
	}

	return {
		presets: [
			[require.resolve('@babel/preset-env'), {
				loose: true,
				modules: options.modules || false,
				targets: {
					browsers: options.browsers || browsers
				},
				exclude: [
					'transform-regenerator',
					'transform-typeof-symbol'
				]
			}]
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
			require.resolve('babel-plugin-macros'),
			!isProd &&
				require.resolve('react-hot-loader/babel'),
		].filter(Boolean),
	};
};
