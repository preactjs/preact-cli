import {
	createConfig,
	entryPoint,
	setOutput,
	customConfig
} from '@webpack-blocks/webpack2';
import { resolve } from 'path';
import baseConfig, { helpers } from './webpack-base-config';

export default (env) => {
	let { cwd } = helpers(env);
	return createConfig.vanilla([
		baseConfig(env),
		entryPoint(resolve(env.cwd, env.src || 'src', 'index.js')),
		setOutput({
			path: resolve(cwd, env.dest || 'build', 'ssr-build'),
			publicPath: '/',
			filename: 'ssr-bundle.js',
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
