const { red, gray } = require('kleur');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const stackTrace = require('stack-trace');
const { SourceMapConsumer } = require('source-map');
const { error, info } = require('../../util');

module.exports = function(env, params) {
	params = params || {};

	let entry = resolve(env.dest, './ssr-build/ssr-bundle.js');
	let url = params.url || '/';

	global.history = {};
	global.location = { href: url, pathname: url };

	try {
		const m = require(entry);
		const app = (m && m.default) || m;

		if (typeof app !== 'function') {
			// eslint-disable-next-line no-console
			console.warn(
				'Entry does not export a Component function/class, aborting prerendering.'
			);
			return '';
		}
		const { cwd } = env;

		const preact = require(require.resolve(`${cwd}/node_modules/preact`));
		const renderToString = require(require.resolve(
			`${cwd}/node_modules/preact-render-to-string`
		));
		return renderToString(preact.h(app, { ...params, url }));
	} catch (err) {
		const stack = stackTrace
			.parse(err)
			.filter(s => s.getFileName().includes('ssr-build'))[0];
		if (!stack) {
			error(err);
			return '';
		}

		handlePrerenderError(err, env, stack, entry);
		return '';
	}
};

async function handlePrerenderError(err, env, stack, entry) {
	const errorMessage = err.toString();
	const isReferenceError = errorMessage.startsWith('ReferenceError');
	const methodName = stack.getMethodName();
	const fileName = stack.getFileName().replace(/\\/g, '/');
	let sourceCodeHighlight = '';

	let position;

	info(fileName);
	if (/webpack:/.test(fileName)) {
		position = {
			source: fileName.replace(/.+webpack:/, 'webpack://'),
			line: stack.getLineNumber(),
			column: stack.getColumnNumber(),
		};
	} else {
		try {
			const sourceMapContent = JSON.parse(readFileSync(`${entry}.map`));

			await SourceMapConsumer.with(sourceMapContent, null, consumer => {
				position = consumer.originalPositionFor({
					line: stack.getLineNumber(),
					column: stack.getColumnNumber(),
				});
			});
		} catch (err) {
			error(`Unable to read sourcemap: ${entry}.map`);
			return;
		}
	}

	if (position) {
		info(position.source);
		position.source = position.source
			.replace('webpack://', '.')
			.replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) =>
				require
					.resolve(name)
					.replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1')
			);
		info(position.source);

		let sourcePath;
		let sourceLines;
		try {
			sourcePath = resolve(env.src, position.source);
			sourceLines = readFileSync(sourcePath, 'utf-8').split('\n');
		} catch (err) {
			try {
				sourcePath = resolve(env.cwd, position.source);
				// sourcePath = require.resolve(position.source);
				sourceLines = readFileSync(sourcePath, 'utf-8').split('\n');
			} catch (err) {
				error(`Unable to read file: ${sourcePath} (${position.source})\n`);
				return;
			}
		}

		if (sourceLines) {
			let lnrl = position.line.toString().length + 1;
			sourceCodeHighlight +=
				gray(
					(position.line - 2 || '').toString().padStart(lnrl) +
						' | ' +
						sourceLines[position.line - 3] || ''
				) + '\n';
			sourceCodeHighlight +=
				gray(
					(position.line - 1 || '').toString().padStart(lnrl) +
						' | ' +
						sourceLines[position.line - 2] || ''
				) + '\n';
			sourceCodeHighlight +=
				red(position.line.toString().padStart(lnrl)) +
				gray(' |  ') +
				sourceLines[position.line - 1] +
				'\n';
			sourceCodeHighlight +=
				gray('| '.padStart(lnrl + 3)) +
				red('^'.padStart(position.column + 1)) +
				'\n';
			sourceCodeHighlight +=
				gray(
					(position.line + 1).toString().padStart(lnrl) +
						' | ' +
						sourceLines[position.line + 0] || ''
				) + '\n';
			sourceCodeHighlight +=
				gray(
					(position.line + 2).toString().padStart(lnrl) +
						' | ' +
						sourceLines[position.line + 1] || ''
				) + '\n';
		}
	} else {
		position = {
			source: stack.getFileName(),
			line: stack.getLineNumber(),
			column: stack.getColumnNumber(),
		};
	}

	process.stderr.write('\n');
	process.stderr.write(`[PrerenderError]: ${red(`${errorMessage}\n`)}`);
	process.stderr.write(
		`  --> ${position.source}:${position.line}:${
			position.column
		} (${methodName || '<anonymous>'})\n`
	);
	process.stderr.write(sourceCodeHighlight + '\n');
	process.stderr.write(red(`${err.stack}\n`));

	process.stderr.write(
		`This ${
			isReferenceError ? 'is most likely' : 'could be'
		} caused by using DOM or Web APIs.\n`
	);
	process.stderr.write(
		`Pre-render runs in node and has no access to globals available in browsers.\n`
	);
	process.stderr.write(
		`Consider wrapping code producing error in: 'if (typeof window !== "undefined") { ... }'\n`
	);

	if (methodName === 'componentWillMount') {
		process.stderr.write(`or place logic in 'componentDidMount' method.\n`);
	}
	process.stderr.write('\n');
	process.stderr.write(
		'Alternatively use `preact build --no-prerender` to disable prerendering.\n'
	);
	process.stderr.write(
		'See https://github.com/developit/preact-cli#pre-rendering for further information.'
	);
	process.exit(1);
}
