import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chalk from 'chalk';

export default (watch=false, config, onprogress) => new Promise( (resolve, reject) => {
	let compiler = webpack(config);

	let done = (err, stats) => {
		if (err) reject(err);
		else {
			// Timeout for plugins that work on `after-emit` event of webpack
			setTimeout(()=>{
				resolve(stats);
			},20);
		}
	};

	if (watch) {
		let first = true;
		compiler.plugin('done', stats => {
			if (first) {
				first = false;
				let serverAddr = `${config.https===true?'https':'http'}://${process.env.HOST || config.host || 'localhost'}:${process.env.PORT || config.port || 8080}`;
				process.stdout.write(`  \u001b[32m> Development server started at ${serverAddr}\u001b[39m\n`);
			}
			if (onprogress) onprogress(stats);
		});
		compiler.plugin('failed', reject);

		let server = new WebpackDevServer(compiler, config.devServer);
		server.listen(config.devServer.port);
	}
	else {
		compiler.run(done);
	}
});

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
