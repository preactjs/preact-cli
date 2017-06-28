export default (env, options={}) => ({
	presets: [
		[require.resolve('babel-preset-env'), {
			loose: true,
			uglify: true,
			modules: options.modules || false,
			targets: {
				browsers: options.browsers
			},
			exclude: [
				'transform-regenerator',
				'transform-es2015-typeof-symbol'
			]
		}],
		require.resolve('babel-preset-stage-0')
	],
	plugins: [
		require.resolve('babel-plugin-transform-object-assign'),
		require.resolve('babel-plugin-transform-decorators-legacy'),
		require.resolve('babel-plugin-transform-react-constant-elements'),
		require.resolve('babel-plugin-transform-react-remove-prop-types'),
		[require.resolve('babel-plugin-transform-react-jsx'), { pragma: 'h' }],
		[require.resolve('babel-plugin-jsx-pragmatic'), {
			module: 'preact',
			export: 'h',
			import: 'h'
		}]
	]
});
