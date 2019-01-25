const chalk = require('chalk');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const stackTrace = require('stack-trace');
const { SourceMapConsumer } = require('source-map');

module.exports = function(env, params) {
	params = params || {};

	let entry = resolve(env.dest, './ssr-build/ssr-bundle.js');
	let url = params.url || '/';

	global.history = {};
	global.location = { href: url, pathname: url };

	try {
		let m = require(entry),
			app = (m && m.default) || m;

		if (typeof app !== 'function') {
			// eslint-disable-next-line no-console
			console.warn(
				'Entry does not export a Component function/class, aborting prerendering.'
			);
			return '';
		}

		let preact = require('preact'),
			renderToString = require('preact-render-to-string');

		return renderToString(preact.h(app, { url }));
	} catch (err) {
		let stack = stackTrace.parse(err).filter(s => s.getFileName() === entry)[0];
		if (!stack) {
			throw err;
		}

		handlePrerenderError(err, env, stack, entry);
	}
};

function handlePrerenderError(err, env, stack, entry) {
	let errorMessage = err.toString();
	let isReferenceError = errorMessage.startsWith('ReferenceError');
	let methodName = stack.getMethodName();
	let sourceMapContent, position, sourcePath, sourceLines, sourceCodeHighlight;

	try {
		sourceMapContent = JSON.parse(readFileSync(`${entry}.map`));
	} catch (err) {
		process.stderr.write(chalk.red(`Unable to read sourcemap: ${entry}.map\n`));
	}

	if (sourceMapContent) {
		let sourceMapConsumer = new SourceMapConsumer(sourceMapContent);
		position = sourceMapConsumer.originalPositionFor({
			line: stack.getLineNumber(),
			column: stack.getColumnNumber(),
		});

		position.source = position.source
			.replace('webpack://', '.')
			.replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) =>
				require
					.resolve(name)
					.replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1')
			);

		sourcePath = resolve(env.src, position.source);
		sourceLines;
		try {
			sourceLines = readFileSync(sourcePath, 'utf-8').split('\n');
		} catch (err) {
			try {
				sourceLines = readFileSync(
					require.resolve(position.source),
					'utf-8'
				).split('\n');
			} catch (err) {
				process.stderr.write(chalk.red(`Unable to read file: ${sourcePath}\n`));
			}
			// process.stderr.write(chalk.red(`Unable to read file: ${sourcePath}\n`));
		}
		sourceCodeHighlight = '';

		if (sourceLines) {
			for (var i = -4; i <= 4; i++) {
				let color = i === 0 ? chalk.red : chalk.yellow;
				let line = position.line + i;
				let sourceLine = sourceLines[line - 1];
				sourceCodeHighlight += sourceLine ? `${color(sourceLine)}\n` : '';
			}
		}
	}

	process.stderr.write('\n');
	process.stderr.write(chalk.red(`${errorMessage}\n`));
	process.stderr.write(`method: ${methodName}\n`);
	if (sourceMapContent) {
		process.stderr.write(
			`at: ${sourcePath}:${position.line}:${position.column}\n`
		);
		process.stderr.write('\n');
		process.stderr.write('Source code:\n\n');
		process.stderr.write(sourceCodeHighlight);
		process.stderr.write('\n');
	} else {
		process.stderr.write(stack.toString() + '\n');
	}
	process.stderr.write(
		`This ${
			isReferenceError ? 'is most likely' : 'could be'
		} caused by using DOM or Web APIs.\n`
	);
	process.stderr.write(
		`Pre-render runs in node and has no access to globals available in browsers.\n\n`
	);
	process.stderr.write(
		`Consider wrapping code producing error in: 'if (typeof window !== "undefined") { ... }'\n`
	);

	if (methodName === 'componentWillMount') {
		process.stderr.write(`or place logic in 'componentDidMount' method.\n`);
	}
	process.stderr.write('\n');
	process.stderr.write(
		`Alternatively use 'preact build --no-prerender' to disable prerendering.\n\n`
	);
	process.stderr.write(
		'See https://github.com/developit/preact-cli#pre-rendering for further information.'
	);
	process.exit(1);
}
