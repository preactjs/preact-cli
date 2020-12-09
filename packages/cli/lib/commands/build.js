const rimraf = require('rimraf');
const { resolve } = require('path');
const { promisify } = require('util');
const { isDir, error } = require('../util');
const runWebpack = require('../lib/webpack/run-webpack');
const { validateArgs } = require('./validate-args');

const toBool = val => val === void 0 || (val === 'false' ? false : val);

const options = [
	{
		name: '--src',
		description: 'Specify source directory',
		default: 'src',
	},
	{
		name: '--dest',
		description: 'Specify output directory',
		default: 'build',
	},
	{
		name: '--cwd',
		description: 'A directory to use instead of $PWD',
		default: '.',
	},
	{
		name: '--esm',
		description: 'Builds ES-2015 bundles for your code',
		default: true,
	},
	{
		name: '--sw',
		description: 'Generate and attach a Service Worker',
		default: true,
	},
	{
		name: '--babelConfig',
		description: 'Path to custom Babel config',
		default: '.babelrc',
	},
	{
		name: '--json',
		description: 'Generate build stats for bundle analysis',
	},
	{
		name: '--template',
		description: 'Path to custom HTML template',
	},
	{
		name: '--preload',
		description: 'Adds preload tags to the document its assets',
		default: false,
	},
	{
		name: '--analyze',
		description: 'Launch interactive Analyzer to inspect production bundle(s)',
	},
	{
		name: '--prerender',
		description: 'Renders route(s) into generated static HTML',
		default: true,
	},
	{
		name: '--prerenderUrls',
		description: 'Path to pre-rendered routes config',
		default: 'prerender-urls.json',
	},
	{
		name: '--brotli',
		description: 'Builds brotli compressed bundles of javascript',
		default: false,
	},
	{
		name: '--inline-css',
		description: 'Adds critical css to the prerendered markup',
		default: true,
	},
	{
		name: '-c, --config',
		description: 'Path to custom CLI config',
		default: 'preact.config.js',
	},
	{
		name: '-v, --verbose',
		description: 'Verbose output',
	},
];

async function command(src, argv) {
	validateArgs(argv, options, 'build');
	argv.src = src || argv.src;
	// add `default:true`s, `--no-*` disables
	argv.prerender = toBool(argv.prerender);
	argv.production = toBool(argv.production);

	let cwd = resolve(argv.cwd);
	let modules = resolve(cwd, 'node_modules');

	if (!isDir(modules)) {
		return error(
			'No `node_modules` found! Please run `npm install` before continuing.',
			1
		);
	}

	if (argv.clean === void 0) {
		let dest = resolve(cwd, argv.dest);
		await promisify(rimraf)(dest);
	}

	let stats = await runWebpack(argv, false);

	if (argv.json) {
		await runWebpack.writeJsonStats(stats);
	}
}

module.exports = {
	command,
	options,
};
