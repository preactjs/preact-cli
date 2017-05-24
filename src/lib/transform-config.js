import path from 'path'
import fs from 'fs.promised'
import {
	webpack,
} from '@webpack-blocks/webpack2';

export default async function (env, config) {
	const transformerPath = path.resolve(env.cwd, env.config);

	try {
		await fs.stat(transformerPath);
	} catch (e) {
		return;
	}

	require('babel-register')();
	const m = require(transformerPath);
	const transformer = m && m.default || m;
	transformer(config, Object.assign({}, env), webpack)
}
