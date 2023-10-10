const ip = require('ip');
const webpack = require('webpack');
const { resolve } = require('path');
const clear = require('console-clear');
const { bold, green, magenta } = require('kleur');
const DevServer = require('webpack-dev-server');
const clientConfig = require('./webpack-client-config');
const serverConfig = require('./webpack-server-config');
const transformConfig = require('./transform-config');
const { isDir, warn } = require('../../util');

/**
 * @param {import('../../../types').Env} env
 */
async function devBuild(config, env) {
	const webpackConfig = await clientConfig(config, env);

	await transformConfig(webpackConfig, config, env);

	let compiler = webpack(webpackConfig);
	return new Promise((res, rej) => {
		compiler.hooks.beforeCompile.tap('CliDevPlugin', () => {
			if (config['clear']) clear(true);
		});

		compiler.hooks.done.tap('CliDevPlugin', stats => {
			const devServer = webpackConfig.devServer;
			const protocol = devServer.https ? 'https' : 'http';

			const serverAddr = `${protocol}://${devServer.host}:${bold(
				devServer.port
			)}`;
			const localIpAddr = `${protocol}://${ip.address()}:${bold(
				devServer.port
			)}`;

			if (!stats.hasErrors()) {
				process.stdout.write(green('Compiled successfully!\n\n'));
				process.stdout.write('You can view the application in browser.\n\n');
				process.stdout.write(`${bold('Local:')}            ${serverAddr}\n`);
				process.stdout.write(`${bold('On Your Network:')}  ${localIpAddr}\n`);
			}
		});

		compiler.hooks.failed.tap('CliDevPlugin', rej);

		let server = new DevServer(webpackConfig.devServer, compiler);
		server.start();
		res(server);
	});
}

/**
 * @param {import('../../../types').Env} env
 */
async function prodBuild(config, env) {
	if (config.prerender) {
		const serverEnv = { ...env, isServer: true };

		const serverWebpackConfig = serverConfig(config, serverEnv);
		await transformConfig(serverWebpackConfig, config, serverEnv);
		const serverCompiler = webpack(serverWebpackConfig);
		await runCompiler(serverCompiler);
	}

	const clientWebpackConfig = await clientConfig(config, env);
	await transformConfig(clientWebpackConfig, config, env);
	const clientCompiler = webpack(clientWebpackConfig);
	await runCompiler(clientCompiler);

	// Timeout for plugins that work on `after-emit` event of webpack
	await new Promise(r => setTimeout(r, 20));
}

/**
 * @param {import('webpack').Compiler} compiler
 */
function runCompiler(compiler) {
	return new Promise((res, rej) => {
		compiler.run((err, stats) => {
			if (err) rej(err);

			showCompilationIssues(stats);

			compiler.close(closeErr => {
				if (closeErr) rej(closeErr);
				res();
			});
		});
	});
}

/**
 * @param {import('webpack').Stats} stats
 */
function showCompilationIssues(stats) {
	if (stats) {
		if (stats.hasWarnings()) {
			allFields(stats, 'warnings').forEach(({ message }) => warn(message));
		}

		if (stats.hasErrors()) {
			allFields(stats, 'errors').forEach(err => {
				throw err;
			});
		}
	}
}

/**
 * Recursively retrieve all errors or warnings from compilation
 *
 * @param {import('webpack').Stats} stats
 * @param {'warnings' | 'errors'} field
 * @returns {import('webpack').StatsError[]}
 */
function allFields(stats, field, fields = [], name = null) {
	const info = stats.toJson({
		errors: true,
		warnings: true,
		errorDetails: false,
	});

	const addCompilerPrefix = msg =>
		name ? bold(magenta(name + ': ')) + msg : msg;

	if (field === 'errors') {
		fields = fields.concat(info.errors.map(addCompilerPrefix));
	} else {
		fields = fields.concat(info.warnings.map(addCompilerPrefix));
	}

	if (stats.compilation.children) {
		stats.compilation.children.forEach((child, index) => {
			const name = child.name || `Child Compiler ${index + 1}`;
			const stats = child.getStats();
			if (field === 'errors' ? stats.hasErrors() : stats.hasWarnings()) {
				fields = allFields(stats, field, fields, name);
			}
		});
	}

	return fields;
}

/**
 * @param {boolean} isProd
 */
module.exports = function (argv, isProd) {
	const env = {
		isProd,
		isWatch: !isProd,
		isServer: false,
	};
	const config = argv;
	config.cwd = resolve(argv.cwd || process.cwd());

	// config.src='src' via `build` default
	const src = resolve(config.cwd, argv.src);
	config.src = isDir(src) ? src : config.cwd;

	// attach sourcing helper
	config.source = dir => resolve(config.src, dir);

	return (isProd ? prodBuild : devBuild)(config, env);
};
