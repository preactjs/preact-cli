import { resolve } from 'path';
import merge from 'webpack-merge';
import baseConfig from './webpack-base-config';

function serverConfig(env) {
	return {
		entry: {
			'ssr-bundle': env.source('index.js')
		},
		output: {
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(env.dest, 'ssr-build'),
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2'
		},
		target: 'node',
		resolveLoader: {
			alias: {
				async: resolve(__dirname, './dummy-loader')
			}
		}
	};
}

export default function (env) {
	return merge(
		baseConfig(env),
		serverConfig(env)
	);
}
