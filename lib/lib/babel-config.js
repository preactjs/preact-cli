'use strict';

exports.__esModule = true;

exports.default = (env, options = {}) => {
	const isProd = env && env.production;

	return {
		babelrc: false,
		presets: [[require.resolve('babel-preset-env'), {
			loose: true,
			uglify: true,
			modules: options.modules || false,
			targets: {
				browsers: options.browsers
			},
			exclude: ['transform-regenerator', 'transform-es2015-typeof-symbol']
		}]],
		plugins: [require.resolve('babel-plugin-syntax-dynamic-import'), require.resolve('babel-plugin-transform-object-assign'), require.resolve('babel-plugin-transform-decorators-legacy'), require.resolve('babel-plugin-transform-class-properties'), require.resolve('babel-plugin-transform-export-extensions'), require.resolve('babel-plugin-transform-object-rest-spread'), require.resolve('babel-plugin-transform-react-constant-elements'), isProd && require.resolve('babel-plugin-transform-react-remove-prop-types'), [require.resolve('babel-plugin-transform-react-jsx'), { pragma: 'h' }], [require.resolve('babel-plugin-jsx-pragmatic'), {
			module: 'preact',
			export: 'h',
			import: 'h'
		}]].filter(Boolean)
	};
};