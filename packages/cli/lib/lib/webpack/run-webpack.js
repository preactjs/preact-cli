const ip = require('ip');
const webpack = require('webpack');
const getPort = require('get-port');
const { resolve } = require('path');
const clear = require('console-clear');
const { writeFile } = require('fs.promised');
const { bold, red, green } = require('chalk');
const DevServer = require('webpack-dev-server');
const clientConfig = require('./webpack-client-config');
const serverConfig = require('./webpack-server-config');
const transformConfig = require('./transform-config');
const { error, isDir, warn } = require('../../util');

async function devBuild(env) {
	let config = clientConfig(env);

	await transformConfig(env, config);

	let userPort =
		parseInt(process.env.PORT || config.devServer.port, 10) || 8080;
	let port = await getPort(userPort);

	let compiler = webpack(config);
	return new Promise((res, rej) => {
		compiler.plugin('emit', (compilation, callback) => {
			let missingDeps = compilation.missingDependencies;
			let nodeModulesPath = resolve(__dirname, '../../../node_modules');

			// ...tell webpack to watch node_modules recursively until they appear.
			if (
				Array.from(missingDeps).some(
					file => file.indexOf(nodeModulesPath) !== -1
				)
			) {
				compilation.contextDependencies.push(nodeModulesPath);
			}

			callback();
		});

		compiler.plugin('done', stats => {
			let devServer = config.devServer;
			let protocol = process.env.HTTPS || devServer.https ? 'https' : 'http';

			let host = process.env.HOST || devServer.host || 'localhost';
			if (host === '0.0.0.0') host = 'localhost';

			let serverAddr = `${protocol}://${host}:${bold(port)}`;
			let localIpAddr = `${protocol}://${ip.address()}:${bold(port)}`;

			clear();

			if (stats.hasErrors()) {
				process.stdout.write(red('Build failed!\n\n'));
			} else {
				process.stdout.write(green('Compiled successfully!\n\n'));

				if (userPort !== port) {
					process.stdout.write(
						`Port ${bold(userPort)} is in use, using ${bold(port)} instead\n\n`
					);
				}
				process.stdout.write('You can view the application in browser.\n\n');
				process.stdout.write(`${bold('Local:')}            ${serverAddr}\n`);
				process.stdout.write(`${bold('On Your Network:')}  ${localIpAddr}\n`);
			}

			showStats(stats);
		});

		compiler.plugin('failed', rej);

		let c = Object.assign({}, config.devServer, {
			stats: { colors: true },
		});

		let server = new DevServer(compiler, c);
		server.listen(port);
		res(server);
	});
}

async function prodBuild(env) {
	let config = clientConfig(env);
	await transformConfig(env, config);

	if (env.prerender) {
		let ssrConfig = serverConfig(env);
		await transformConfig(env, ssrConfig, true);
		let serverCompiler = webpack(ssrConfig);
		await runCompiler(serverCompiler);
	}

	let clientCompiler = webpack(config);
	let stats = await runCompiler(clientCompiler);

	// Timeout for plugins that work on `after-emit` event of webpack
	await new Promise(r => setTimeout(r, 20));

	return showStats(stats);
}

function runCompiler(compiler) {
	return new Promise((res, rej) => {
		compiler.run((err, stats) => {
			if (stats && stats.hasErrors()) {
				showStats(stats);
			}

			if (err || (stats && stats.hasErrors())) {
				rej(red('Build failed! ' + err));
			}

			res(stats);
		});
	});
}

function showStats(stats) {
	let info = stats.toJson('errors-only');

	if (stats.hasErrors()) {
		info.errors.map(stripLoaderPrefix).forEach(msg => error(msg));
	}

	if (stats.hasWarnings()) {
		info.warnings.map(stripLoaderPrefix).forEach(msg => warn(msg));
	}

	return stats;
}

function writeJsonStats(stats) {
	let outputPath = resolve(process.cwd(), 'stats.json');
	let jsonStats = stats.toJson({
		json: true,
		chunkModules: true,
		source: false,
	});

	function strip(stats) {
		stats.modules.forEach(stripLoaderFromModuleNames);
		stats.chunks.forEach(c => {
			(
				c.modules ||
				(c.mapModules != null ? c.mapModules(Object) : c.getModules())
			).forEach(stripLoaderFromModuleNames);
		});
		if (stats.children) stats.children.forEach(strip);
	}

	strip(jsonStats);

	return writeFile(outputPath, JSON.stringify(jsonStats)).then(() => {
		process.stdout.write('\nWebpack output stats generated.\n\n');
		process.stdout.write('You can upload your stats.json to:\n');
		process.stdout.write(
			'- https://chrisbateman.github.io/webpack-visualizer/\n'
		);
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
	'moduleIdentifier',
];

/** Removes all loaders from any resource identifiers found in a string */
function stripLoaderPrefix(str) {
	if (typeof str === 'string') {
		return str.replace(
			/(^|\b|@)(\.\/~|\.{0,2}\/[^\s]+\/node_modules)\/\w+-loader(\/[^?!]+)?(\?\?[\w_.-]+|\?({[\s\S]*?})?)?!/g,
			''
		);
	}
	return str;
}

function stripLoaderFromModuleNames(m) {
	for (let key in m) {
		if (
			m.hasOwnProperty(key) &&
			m[key] != null &&
			~keysToNormalize.indexOf(key)
		) {
			m[key] = stripLoaderPrefix(m[key]);
		}
	}

	if (m.reasons) {
		m.reasons.forEach(stripLoaderFromModuleNames);
	}

	return m;
}

module.exports = function(env, watch = false) {
	env.isProd = env.production; // shorthand
	env.isWatch = !!watch; // use HMR?
	env.cwd = resolve(env.cwd || process.cwd());

	// env.src='src' via `build` default
	let src = resolve(env.cwd, env.src);
	env.src = isDir(src) ? src : env.cwd;

	// attach sourcing helper
	env.source = dir => resolve(env.src, dir);

	// determine build-type to run
	return (watch ? devBuild : prodBuild)(env);
};

module.exports.writeJsonStats = writeJsonStats;
