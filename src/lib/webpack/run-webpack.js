import path from 'path';
import fs from 'fs.promised';
import ip from 'ip';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';
import getPort from 'get-port';
import clientConfig from './webpack-client-config';
import serverConfig from './webpack-server-config';
import transformConfig from './transform-config';
import { error, warn } from '../../util';

export default function (watch=false, env, onprogress) {
	let fn = watch ? devBuild : prodBuild;
	return fn(env, onprogress); // AsyncFunctioon
}


const devBuild = async (env, onprogress) => {
	let config = clientConfig(env);
	await transformConfig(env, config);

	let userPort = parseInt(process.env.PORT || config.devServer.port, 10) || 8080;
	let port = await getPort(userPort);

	let compiler = webpack(config);
	return await new Promise((resolve, reject) => {

		compiler.plugin('emit', (compilation, callback) => {
			var missingDeps = compilation.missingDependencies;
			var nodeModulesPath = path.resolve(__dirname, '../../../node_modules');

			if (missingDeps.some(file => file.indexOf(nodeModulesPath) !== -1)) {
				// ...tell webpack to watch node_modules recursively until they appear.
				compilation.contextDependencies.push(nodeModulesPath);
			}

			callback();
		});

		compiler.plugin('done', stats => {
			let devServer = config.devServer;
			let protocol = (process.env.HTTPS || devServer.https) ? 'https' : 'http';
			let host = process.env.HOST || devServer.host || 'localhost';

			if (host === '0.0.0.0') host = 'localhost';

			let serverAddr = `${protocol}://${host}:${chalk.bold(port)}`;
			let localIpAddr = `${protocol}://${ip.address()}:${chalk.bold(port)}`;

			clearConsole();
			if (stats.hasErrors()) {
				process.stdout.write(chalk.red('\Build failed!\n\n'));
			} else {
				process.stdout.write(chalk.green('Compiled successfully!\n\n'));

				if (userPort !== port) {
					process.stdout.write(`Port ${chalk.bold(userPort)} is in use, using ${chalk.bold(port)} instead\n\n`);
				}
				process.stdout.write('You can view the application in browser.\n\n');
				process.stdout.write(`${chalk.bold('Local:')}            ${serverAddr}\n`);
				process.stdout.write(`${chalk.bold('On Your Network:')}  ${localIpAddr}\n`);
			}

			if (onprogress) onprogress(stats);
		});
		compiler.plugin('failed', reject);

		let server = new WebpackDevServer(compiler, config.devServer);
		server.listen(port);
	});
};

const prodBuild = async (env) => {
	let config = clientConfig(env);

	await transformConfig(env, config);
	let serverCompiler, clientCompiler = webpack(config);

	if (env.prerender) {
		let ssrConfig = serverConfig(env);
		await transformConfig(env, ssrConfig, true);
		serverCompiler = webpack(ssrConfig);
		await runCompiler(serverCompiler);
	}

	let stats = await runCompiler(clientCompiler);

	// Timeout for plugins that work on `after-emit` event of webpack
	await new Promise(r => setTimeout(()=>	r(), 20));

	return stats;
};

const runCompiler = compiler => new Promise((resolve, reject) => {
	compiler.run((err, stats) => {
		if (err || stats.hasErrors()) {
			showStats(stats);
			reject(chalk.red('Build failed!'));
		}

		resolve(stats);
	});
});

export function showStats(stats) {
	let info = stats.toJson('errors-only');

	if (stats.hasErrors()) {
		info.errors.map(stripBabelLoaderPrefix).forEach(msg => error(msg));
	}

	if (stats.hasWarnings()) {
		info.warnings.map(stripBabelLoaderPrefix).forEach(msg => warn(msg));
	}

	return stats;
}

export function writeJsonStats(stats) {
	let outputPath = path.resolve(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({
		json: true,
		chunkModules: true,
		source: false,
	});

	jsonStats = (jsonStats.children && jsonStats.children[0]) || jsonStats;

	jsonStats.modules.forEach(stripBabelLoaderFromModuleNames);
	jsonStats.chunks.forEach(c => c.modules.forEach(stripBabelLoaderFromModuleNames));

	return fs.writeFile(outputPath, JSON.stringify(jsonStats))
		.then(() => {
			process.stdout.write('\nWebpack output stats generated.\n\n');
			process.stdout.write('You can upload your stats.json to:\n');
			process.stdout.write('- https://chrisbateman.github.io/webpack-visualizer/\n');
			process.stdout.write('- https://webpack.github.io/analyse/\n');
		});
}

const clearConsole = () => {
	process.stdout.write(
		process.platform === 'win32' ? '\x1Bc' : '\x1B[2J\x1B[3J\x1B[H'
	);
};

const stripBabelLoaderFromModuleNames = m => {
	const keysToNormalize = ['identifier', 'name', 'module', 'moduleName', 'moduleIdentifier'];

	keysToNormalize.forEach(key => {
		if (key in m) {
			m[key] = stripBabelLoaderPrefix(m[key]);
		}
	});

	if (m.reasons) {
		m.reasons.forEach(stripBabelLoaderFromModuleNames);
	}

	return m;
};

const stripBabelLoaderPrefix = log => log.replace(/@?\s*(\.\/~\/babel-loader\/lib\?{[\s\S]*?}!)/g, '');
