const runWebpack = require('../lib/webpack/run-webpack');
const { isPortFree, toBool, warn } = require('../util');
const { validateArgs } = require('./validate-args');
const getPort = require('get-port');
const { resolve } = require('path');

const options = [
	{
		name: '--src',
		description: 'Specify source directory',
		default: 'src',
	},
	{
		name: '--cwd',
		description: 'A directory to use instead of $PWD',
		default: '.',
	},
	{
		name: '--esm',
		description: 'Builds ES-2015 bundles for your code',
		default: false,
	},
	{
		name: '--clear',
		description: 'Clear the console',
		default: true,
	},
	{
		name: '--sw',
		description: 'Generate and attach a Service Worker',
		default: undefined,
	},
	{
		name: '--babelConfig',
		description: 'Path to custom Babel config',
		default: '.babelrc',
	},
	{
		name: '--rhl',
		description: '(Deprecated) use --refresh instead',
		default: false,
	},
	{
		name: '--json',
		description: 'Generate build stats for bundle analysis',
	},
	{
		name: '--https',
		description: 'Run server with HTTPS protocol',
	},
	{
		name: '--key',
		description: 'Path to PEM key for custom SSL certificate',
	},
	{
		name: '--cert',
		description: 'Path to custom SSL certificate',
	},
	{
		name: '--cacert',
		description: 'Path to optional CA certificate override',
	},
	{
		name: '--prerender',
		description: 'Pre-render static content on first run',
	},
	{
		name: '--prerenderUrls',
		description: 'Path to pre-rendered routes config',
		default: 'prerender-urls.json',
	},
	{
		name: '--template',
		description: 'Path to custom HTML template (default "src/template.html")',
	},
	{
		name: '--refresh',
		description: 'Enables experimental preact-refresh functionality',
		default: false,
	},
	{
		name: '-c, --config',
		description: 'Path to custom CLI config',
		default: 'preact.config.js',
	},
	{
		name: '-H, --host',
		description: 'Set server hostname',
		default: '0.0.0.0',
	},
	{
		name: '-p, --port',
		description: 'Set server port (default 8080)',
	},
];

async function command(src, argv) {
	validateArgs(argv, options, 'watch');
	if (argv.rhl) {
		delete argv.rhl;
		argv.refresh = argv.rhl;
	}
	argv.src = src || argv.src;
	argv.production = false;
	if (argv.sw) {
		argv.sw = toBool(argv.sw);
	}

	let cwd = resolve(argv.cwd);

	// we explicitly set the path as `dotenv` otherwise uses
	// `process.cwd()` -- this would cause issues in environments
	// like mono-repos or our test suite subjects where project root
	// and the current directory differ.
	require('dotenv').config({ path: resolve(cwd, '.env') });

	argv.port = await determinePort(argv.port);

	if (argv.https || process.env.HTTPS) {
		let { key, cert, cacert } = argv;
		if (key && cert) {
			argv.https = { key, cert, ca: cacert };
		} else {
			warn('Reverting to `webpack-dev-server` internal certificate.');
		}
	}

	return runWebpack(argv, true);
}

async function determinePort(port) {
	port = parseInt(port, 10);
	if (port) {
		if (!(await isPortFree(port))) {
			throw new Error(
				`Another process is already running on port ${port}. Please choose a different port.`
			);
		}
	} else {
		port = await getPort({ port: parseInt(process.env.PORT, 10) || 8080 });
	}

	return port;
}

module.exports = {
	command,
	options,
	determinePort,
};
