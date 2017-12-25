import getCert from '../lib/ssl-cert';
import runWebpack, { showStats } from '../lib/webpack/run-webpack';
import { warn } from '../util';

export default async function (src, argv) {
	argv.src = src || argv.src;
	argv.production = false;

	if (argv.https || process.env.HTTPS) {
		let ssl = await getCert();
		if (!ssl) {
			ssl = true;
			warn('Reverting to `webpack-dev-server` internal certificate.');
		}
		argv.https = ssl;
	}

	let stats = await runWebpack(true, argv, showStats);
	showStats(stats);
}
