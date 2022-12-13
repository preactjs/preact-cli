const ip = require('ip');
const webpack = require('webpack');
const { resolve } = require('path');
const clear = require('console-clear');
const { bold, red, green, magenta } = require('kleur');
const DevServer = require('webpack-dev-server');
const clientConfig = require('./webpack-client-config');
const serverConfig = require('./webpack-server-config');
const transformConfig = require('./transform-config');
const { error, isDir, warn } = require('../../util');

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

			if (stats.hasErrors()) {
				process.stdout.write(red('Build failed!\n\n'));
			} else {
				process.stdout.write(green('Compiled successfully!\n\n'));
				process.stdout.write('You can view the application in browser.\n\n');
				process.stdout.write(`${bold('Local:')}            ${serverAddr}\n`);
				process.stdout.write(`${bold('On Your Network:')}  ${localIpAddr}\n`);
			}

			showStats(stats, false);
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

	try {
		let stats = await runCompiler(clientCompiler);

		// Timeout for plugins that work on `after-emit` event of webpack
		await new Promise(r => setTimeout(r, 20));

		return showStats(stats, true);
	} catch (err) {
		// eslint-disable-next-line
		console.log(err);
	}
}

function runCompiler(compiler) {
	return new Promise(res => {
		compiler.run((err, stats) => {
			if (err) {
				error(err, 1);
			}

			showStats(stats, true);

			res(stats);
		});
	});
}

function showStats(stats, isProd) {
	if (stats) {
		if (stats.hasErrors()) {
			allFields(stats, 'errors')
				.map(stripLoaderPrefix)
				.forEach(({ message }) => error(message, isProd ? 1 : 0));
		}

		if (stats.hasWarnings()) {
			allFields(stats, 'warnings')
				.map(stripLoaderPrefix)
				.forEach(({ message }) => warn(message));
		}
	}

	return stats;
}

function allFields(stats, field, fields = [], name = null) {
	const info = stats.toJson({
		errors: true,
		warnings: true,
		errorDetails: false,
	});
	const addCompilerPrefix = msg =>
		name ? bold(magenta(name + ': ')) + msg : msg;
	if (field === 'errors' && stats.hasErrors()) {
		fields = fields.concat(info.errors.map(addCompilerPrefix));
	}
	if (field === 'warnings' && stats.hasWarnings()) {
		fields = fields.concat(info.warnings.map(addCompilerPrefix));
	}
	if (stats.compilation.children) {
		stats.compilation.children.forEach((child, index) => {
			const name = child.name || `Child Compiler ${index + 1}`;
			const stats = child.getStats();
			fields = allFields(stats, field, fields, name);
		});
	}
	return fields;
}

/** Removes all loaders from any resource identifiers found in a string */
function stripLoaderPrefix(str) {
	if (typeof str === 'string') {
		str = str.replace(
			/(?:(\()|(^|\b|@))(\.\/~|\.{0,2}\/(?:[^\s]+\/)?node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g,
			'$1'
		);
		str = str.replace(/(\.?\.?(?:\/[^/ ]+)+)\s+\(\1\)/g, '$1');
		str = replaceAll(str, process.cwd(), '.');
		return str;
	}
	return str;
}

// https://gist.github.com/developit/1a40a6fee65361d1182aaa22ab8c334c
function replaceAll(str, find, replace) {
	let s = '',
		index,
		next;
	while (~(next = str.indexOf(find, index))) {
		s += str.substring(index, next) + replace;
		index = next + find.length;
	}
	return s + str.substring(index);
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
