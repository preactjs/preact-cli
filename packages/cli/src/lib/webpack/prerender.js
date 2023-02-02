const { red, yellow } = require('kleur');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const stackTrace = require('stack-trace');
const { URL } = require('url');
const { SourceMapConsumer } = require('source-map');

module.exports = async function (config, params) {
	params = params || {};

	let entry = resolve(config.dest, './ssr-build/ssr-bundle.js');
	let url = params.url || '/';

	global.history = /** @type {object} */ ({});
	global.location = /** @type {object} */ (new URL(url, 'http://localhost'));

	try {
		let m = require(entry),
			vnode = (m && m.default) || m;

		if (typeof vnode !== 'function') {
			// eslint-disable-next-line no-console
			console.warn(
				'Entry does not export a Component function/class, aborting prerendering.'
			);
			return '';
		}

		const preact = require(require.resolve('preact', { paths: [config.cwd] }));
		const renderToString = require(require.resolve('preact-render-to-string', {
			paths: [config.cwd],
		}));

		vnode = preact.h(vnode, { ...params, url });

		// Slightly modified version of preact-iso's `prerender()`
		let tries;
		const maxDepth = 10;
		const render = () => {
			if (++tries > maxDepth) return;
			try {
				return renderToString(vnode);
			} catch (e) {
				if (e && e.then) return e.then(render);
				throw e;
			}
		};

		return await render();
	} catch (err) {
		let stack = stackTrace.parse(err).filter(s => s.getFileName() === entry)[0];
		if (!stack) {
			throw err;
		}

		await handlePrerenderError(err, config, stack, entry);
	}
};

async function handlePrerenderError(err, config, stack, entry) {
	let errorMessage = err.toString();
	let isReferenceError = errorMessage.startsWith('ReferenceError');
	let methodName = stack.getMethodName();
	let sourceMapContent, position, sourcePath, sourceLines, sourceCodeHighlight;

	try {
		sourceMapContent = JSON.parse(readFileSync(`${entry}.map`, 'utf-8'));
	} catch (err) {
		process.stderr.write(red(`\n\nUnable to read sourcemap: ${entry}.map\n`));
	}

	if (sourceMapContent) {
		position = await SourceMapConsumer.with(sourceMapContent, null, consumer =>
			consumer.originalPositionFor({
				line: stack.getLineNumber(),
				column: stack.getColumnNumber(),
			})
		);

		if (position.source) {
			position.source = position.source
				.replace('webpack://', '.')
				.replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) =>
					require
						.resolve(name)
						.replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1')
				);

			sourcePath = resolve(config.cwd, position.source);
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
					process.stderr.write(red(`\n\nUnable to read file: ${sourcePath}\n`));
				}
			}
			sourceCodeHighlight = '';
		}

		if (sourceLines) {
			for (var i = -4; i <= 4; i++) {
				let color = i === 0 ? red : yellow;
				let line = position.line + i;
				let sourceLine = sourceLines[line - 1];
				sourceCodeHighlight += sourceLine ? `${color(sourceLine)}\n` : '\n';
			}
		}
	}

	process.stderr.write('\n');
	process.stderr.write(red(`\n${errorMessage}\n`));

	if (sourceMapContent && sourceCodeHighlight) {
		process.stderr.write(`method: ${methodName}\n`);
		process.stderr.write(
			`at: ${sourcePath}:${position.line}:${position.column}\n`
		);
		process.stderr.write('\n');
		process.stderr.write('Source code:\n');
		process.stderr.write(sourceCodeHighlight);
		process.stderr.write('\n');
	} else {
		process.stderr.write('\n');
		process.stderr.write('Stack:\n\n');
		process.stderr.write(JSON.stringify(stack, null, 4) + '\n');
	}

	const message = `
		This ${
			isReferenceError ? 'is most likely' : 'could be'
		} caused by using DOM or Web APIs.
		Pre-rendering runs in Node and therefore has no access browser globals.

		Consider wrapping the code producing the error in: 'if (typeof window !== "undefined") { ... }'
		${
			methodName === 'componentWillMount'
				? 'or place logic in "componentDidMount" method.'
				: ''
		}

		Alternatively, disable prerendering altogether with 'preact build --no-prerender'.

		See https://github.com/preactjs/preact-cli#pre-rendering for further information.
	`;
	process.stderr.write(
		message
			.trim()
			.replace(/^\t+/gm, '')
			.replace(/\n\n\n/, '\n\n') + '\n\n'
	);
	process.exit(1);
}
