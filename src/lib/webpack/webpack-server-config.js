import {
	createConfig,
	entryPoint,
	setOutput,
	customConfig
} from '@webpack-blocks/webpack2';
import { resolve } from 'path';
import baseConfig from './webpack-base-config';

export default env => {
	let entry = env.source('index.js');
	return createConfig.vanilla([
		baseConfig(env),
		entryPoint(entry),
		setOutput({
			publicPath: '/',
			filename: 'ssr-bundle.js',
			path: resolve(env.dest, 'ssr-build'),
			chunkFilename: '[name].chunk.[chunkhash:5].js',
			libraryTarget: 'commonjs2'
		}),

		customConfig({
			target: 'node'
		}),

		customConfig({
			resolveLoader: {
				alias: {
					'async': resolve(__dirname, './dummy-loader')
				},
			}
		})
	]);
};
