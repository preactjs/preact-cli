/* eslint-disable no-console */
const { join } = require('path');
const { symlink, readFile } = require('fs').promises;
const pRetry = require('p-retry');
const { promisify } = require('util');

const LOG = !!process.env.WITH_LOG;
const logger = (lvl, msg) => (lvl === 'error' || LOG) && console[lvl](msg);

const snapshotExtensionOrder = [
	{ ext: /(?<!\.esm)\.js$/, order: 1 },
	{ ext: /(?<!\.esm)\.js\.map$/, order: 2 },
	{ ext: /\.esm\.js$/, order: 3 },
	{ ext: /\.esm\.js\.map$/, order: 4 },
	{ ext: /\.css$/, order: 5 },
	{ ext: /\.css\.map$/, order: 6 },
];

/**
 * @typedef {Object} Node
 * @property {string} path
 * @property {string} name
 * @property {Node[]} [children]
 * @property {number} [size]
 */

/**
 * Generate prettified directory snapshot
 * Modified from: https://github.com/developit/microbundle/blob/master/test/index.test.js
 *
 * @param {Node[]} nodes
 * @param {boolean} isBuild
 * @param {number} indentLevel
 */
async function snapshotDir(nodes, isBuild = true, indentLevel = 0) {
	const indent = '  '.repeat(indentLevel);

	if (isBuild) {
		// Directories[A->Z], files [A->Z] + [.js -> .js.map -> .esm.js -> esm.js.map -> .css -> .css.map]
		// Ensures consistent ordering so that changing hashes don't massacre the diff when updated
		nodes.sort((a, b) => {
			if (a.children && !b.children) return -1;

			const assetName = ({ name }) => name.match(/([^.]*)/);
			const extIndex = ({ name }) =>
				snapshotExtensionOrder.findIndex(e => e.ext.test(name));

			const assetNameA = assetName(a);
			const assetNameB = assetName(b);

			if (assetNameA && assetNameB && assetNameA[1] === assetNameB[1]) {
				return extIndex(a) - extIndex(b);
			}
			return a.name < b.name ? -1 : 1;
		});
	}

	return (
		await Promise.all(
			nodes.map(async node => {
				// Sourcemaps paths can differ between environments and are therefore
				// not useful to test. Strip before comparing sizes.
				if (isBuild && /\.map$/.test(node.name)) {
					let fileContent = await readFile(node.path, 'utf-8');
					fileContent = fileContent.replace(/"sources":[^\]]*]/, '');
					node.size = new TextEncoder().encode(fileContent).length;
				}

				const isDir = node.children;
				return `${indent}${node.name}${
					isBuild && !isDir ? `: ${node.size}` : ''
				}\n${
					isDir
						? await snapshotDir(node.children, isBuild, indentLevel + 1)
						: ``
				}`;
			})
		)
	).join('');
}

async function log(fn, msg) {
	logger('info', `${msg} - started...`);
	try {
		let result = await fn();
		logger('info', `${msg} - done.`);
		return result;
	} catch (err) {
		logger('error', `${msg} - failed!`);
		throw err;
	}
}

function waitUntil(action, errorMessage) {
	return pRetry(action, { retries: 10, minTimeout: 250 }).catch(err => {
		console.log('> waitUntil error', err);
		throw new Error(errorMessage);
	});
}

const sleep = promisify(setTimeout);

async function linkPackage(name, cwd) {
	const root = join(__dirname, '../../../..');
	try {
		await symlink(
			join(root, 'node_modules', name),
			join(cwd, 'node_modules', name)
		);
	} catch {}
}

module.exports = {
	snapshotDir,
	log,
	waitUntil,
	sleep,
	linkPackage,
};
