import ip from 'ip';
import { resolve } from 'path';
import { writeFile } from 'fs.promised';
import webpack from 'webpack';
import chalk from 'chalk';
import getPort from 'get-port';
import clearConsole from 'console-clear';
import DevServer from 'webpack-dev-server';
import clientConfig from './webpack-client-config';
import serverConfig from './webpack-server-config';
import transformConfig from './transform-config';
import { error, isDir, warn } from '../../util';

export default function (watch=false, env, onprogress) {
	env.isProd = env.production; // shorthand
	env.cwd = resolve(env.cwd || process.cwd());

	// env.src='src' via `build` default
	let src = resolve(env.cwd, env.src);
	env.src = isDir(src) ? src : env.cwd;

	// attach sourcing helper
	env.source = dir => resolve(env.src, dir);

	// determine build-type to run
	let fn = watch ? devBuild : prodBuild;
	return fn(env, onprogress); // AsyncFunctioon
}

async function devBuild(env, onprogress) {
	let config = clientConfig(env);

	await transformConfig(env, config);

	let userPort = parseInt(process.env.PORT || config.devServer.port, 10) || 8080;
	let port = await getPort(userPort);

	let compiler = webpack(config);
	return await new Promise((_, rej) => {
		compiler.plugin('emit', (compilation, callback) => {
			var missingDeps = compilation.missingDependencies;
			var nodeModulesPath = resolve(__dirname, '../../../node_modules');

			// ...tell webpack to watch node_modules recursively until they appear.
			if (missingDeps.some(file => file.indexOf(nodeModulesPath) !== -1)) {
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

		compiler.plugin('failed', rej);

		new DevServer(compiler, config.devServer).listen(port);
	});
}

async function prodBuild(env) {
	let config = clientConfig(env);

	await transformConfig(env, config);
	let serverCompiler, clientCompiler=webpack(config);

	if (env.prerender) {
		let ssrConfig = serverConfig(env);
		await transformConfig(env, ssrConfig, true);
		serverCompiler = webpack(ssrConfig);
		await runCompiler(serverCompiler);
	}

	let stats = await runCompiler(clientCompiler);

	// Timeout for plugins that work on `after-emit` event of webpack
	await new Promise(r => setTimeout(r, 20));

	return stats;
}

const runCompiler = compiler => new Promise((res, rej) => {
	compiler.run((err, stats) => {
		if (err || stats.hasErrors()) {
			showStats(stats);
			rej(chalk.red('Build failed!'));
		}

		res(stats);
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
	let outputPath = resolve(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({ json:true, chunkModules:true, source:false });

	jsonStats = (jsonStats.children && jsonStats.children[0]) || jsonStats;

	jsonStats.modules.forEach(stripBabelLoaderFromModuleNames);
	jsonStats.chunks.forEach(c => c.forEachModule(stripBabelLoaderFromModuleNames));

	return writeFile(outputPath, JSON.stringify(jsonStats)).then(() => {
		process.stdout.write('\nWebpack output stats generated.\n\n');
		process.stdout.write('You can upload your stats.json to:\n');
		process.stdout.write('- https://chrisbateman.github.io/webpack-visualizer/\n');
		process.stdout.write('- https://webpack.github.io/analyse/\n');
	});
}

const keysToNormalize = ['identifier', 'name', 'module', 'moduleName', 'moduleIdentifier'];

const stripBabelLoaderPrefix = log => log.replace(/@?\s*(\.\/~\/babel-loader\/lib\?{[\s\S]*?}!)/g, '');

function stripBabelLoaderFromModuleNames(m) {
	keysToNormalize.forEach(key => {
		if (key in m) {
			m[key] = stripBabelLoaderPrefix(m[key]);
		}
	});

	if (m.reasons) {
		m.reasons.forEach(stripBabelLoaderFromModuleNames);
	}

	return m;
}
