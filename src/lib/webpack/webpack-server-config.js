import merge from 'webpack-merge';
import { resolve } from 'path';
import baseConfig from './webpack-base-config';

export default (env) => merge(
	baseConfig(env),
	{
		entry: {
			'ssr-bundle': resolve(env.cwd, env.src || 'src', 'index.js'),
		},

		output: {
			path: resolve(env.dest, 'ssr-build'),
			publicPath: '/',
			filename: '[name].js',
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2'
		},

		target: 'node',

		resolveLoader: {
			alias: {
				'async': resolve(__dirname, './dummy-loader')
			},
		}
	}
);

