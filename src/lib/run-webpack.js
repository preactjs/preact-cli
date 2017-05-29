import path from 'path';
import rimraf from 'rimraf';
import fs from 'fs.promised';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';

export default (watch=false, env, config, onprogress) => {
	if (watch) {
		return devBuild(config, onprogress);
	}
	else {
		return prodBuild(env, config);
	}
};

const devBuild = (config, onprogress) => {
	let compiler = webpack(config);
	return new Promise((resolve, reject) => {
		let first = true;
		compiler.plugin('done', stats => {
			if (first) {
				first = false;
				let devServer = config.devServer;
				let serverAddr = `${devServer.https===true?'https':'http'}://${process.env.HOST || devServer.host || 'localhost'}:${process.env.PORT || devServer.port || 8080}`;
				process.stdout.write(`  \u001b[32m> Development server started at ${serverAddr}\u001b[39m\n`);
			}
			if (onprogress) onprogress(stats);
		});
		compiler.plugin('failed', reject);

		let server = new WebpackDevServer(compiler, config.devServer);
		server.listen(config.devServer.port);
	});
};

const prodBuild = (env, config) => {
	let ssrOutputPath = path.resolve(__dirname, 'ssr-build/');
	let ssrConfig = (config) => {
		let newConfig = Object.assign({}, config, {
			target: 'node',
			entry: path.resolve(env.cwd, env.src || 'src', 'index.js'),
			plugins: config.plugins.filter(c => !(c.constructor && c.constructor.name === 'HtmlWebpackPlugin')),
		});

		newConfig.output.path = ssrOutputPath;
		newConfig.output.libraryTarget = 'commonjs2';

		let asyncLoaderIndex = newConfig.module.loaders
			.findIndex(l => l.loader === path.resolve(__dirname, 'async-component-loader'));

		// Remove async loader in prerender because all chunks are available.
		if (asyncLoaderIndex > -1) {
			newConfig.module.loaders.splice(asyncLoaderIndex, 1);
		}

		return newConfig;
	};
	let compiler = webpack(config);
	let runCompiler = () => new Promise((resolve, reject) => {
		console.log('Running production build...');
		compiler.run((err, stats) => {
			if (err) reject(err);
			else {
				// Timeout for plugins that work on `after-emit` event of webpack
				setTimeout(()=>	resolve(stats), 20);
			}
		});
	});

	let ssrCompiler = webpack(ssrConfig(config));
	let runSsrCompiler = () => new Promise((resolve, reject) => {
		console.log('Running SSR build...');
		rimraf.sync(ssrOutputPath);
		ssrCompiler.run((err) => {
			if (err) return reject(err);
			// Timeout for plugins that work on `after-emit` event of webpack
			setTimeout(()=>	resolve(), 20);
		});
	});

	return env.prerender ? runSsrCompiler().then(runCompiler) : runCompiler();
};

export function showStats(stats) {
	let info = stats.toJson();

	if (stats.hasErrors()) {
		info.errors.forEach( message => {
			process.stderr.write(message+'\n');
		});
	}

	if (stats.hasWarnings()) {
		info.warnings.forEach( message => {
			process.stderr.write(chalk.yellow(message)+'\n');
		});
	}

	return stats;
}

export function writeJsonStats(stats) {
	const outputPath = path.resolve(process.cwd(), 'stats.json');
	const jsonStats = stats.toJson({
		json: true,
		chunkModules: true,
		source: false,
	});

	jsonStats.modules.forEach(normalizeModule);
	jsonStats.chunks.forEach(c => c.modules.forEach(normalizeModule));

	return fs.writeFile(outputPath, JSON.stringify(jsonStats))
		.then(() => {
			process.stdout.write('\nWebpack output stats generated.\n\n');
			process.stdout.write('You can upload your stats.json to:\n');
			process.stdout.write('- https://chrisbateman.github.io/webpack-visualizer/\n');
			process.stdout.write('- https://webpack.github.io/analyse/\n');
		});
}

const normalizeModule = m => {
	const keysToNormalize = ['identifier', 'name', 'module', 'moduleName', 'moduleIdentifier'];

	keysToNormalize.forEach(key => {
		if (key in m) {
			m[key] = normalizeName(m[key]);
		}
	});

	if (m.reasons) {
		m.reasons.forEach(normalizeModule);
	}

	return m;
};

const normalizeName = p => p.substr(p.lastIndexOf('!') + 1);
