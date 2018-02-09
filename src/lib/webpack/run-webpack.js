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
		if (stats && stats.hasErrors()) {
			showStats(stats);
		}

		if (err || (stats && stats.hasErrors())) {
			rej(chalk.red('Build failed! ' + err));
		}

		res(stats);
	});
});

export function showStats(stats) {
	let info = stats.toJson('errors-only');

	if (stats.hasErrors()) {
		info.errors.map(stripLoaderPrefix).forEach(msg => error(msg));
	}

	if (stats.hasWarnings()) {
		info.warnings.map(stripLoaderPrefix).forEach(msg => warn(msg));
	}

	return stats;
}

export function writeJsonStats(stats) {
	let outputPath = resolve(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({ json:true, chunkModules:true, source:false });

	function strip(stats) {
		stats.modules.forEach(stripLoaderFromModuleNames);
		stats.chunks.forEach(c => {
			(c.modules || (c.mapModules!=null ? c.mapModules(Object) : c.getModules())).forEach(stripLoaderFromModuleNames);
		});
		if (stats.children) stats.children.forEach(strip);
	}

	strip(jsonStats);

	return writeFile(outputPath, JSON.stringify(jsonStats)).then(() => {
		process.stdout.write('\nWebpack output stats generated.\n\n');
		process.stdout.write('You can upload your stats.json to:\n');
		process.stdout.write('- https://chrisbateman.github.io/webpack-visualizer/\n');
		process.stdout.write('- https://webpack.github.io/analyse/\n');
	});
}

const keysToNormalize = [
	'issuer',
	'issuerName',
	'identifier',
	'name',
	'module',
	'moduleName',
	'moduleIdentifier'
];

/** Removes all loaders from any resource identifiers found in a string */
function stripLoaderPrefix(str) {
	if (typeof str==='string') {
		return str.replace(/(^|\b|@)(\.\/~|\.{0,2}\/[^\s]+\/node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g, '');
	}
	return str;
}

function stripLoaderFromModuleNames(m) {
	for (let key in m) {
		if (m.hasOwnProperty(key) && m[key]!=null && ~keysToNormalize.indexOf(key)) {
			m[key] = stripLoaderPrefix(m[key]);
		}
	}

	if (m.reasons) {
		m.reasons.forEach(stripLoaderFromModuleNames);
	}

	return m;
}
