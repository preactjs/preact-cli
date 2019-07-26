const { red } = require('kleur');
const { resolve } = require('path');
const { readFileSync } = require('fs');
const stackTrace = require('stack-trace');
const { SourceMapConsumer } = require('source-map');
const { error, info } = require('../../util');
const outdent = require('outdent');
const { codeFrameColumns } = require('@babel/code-frame');

module.exports = function prerender(env, params) {
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

function getLines(env, position) {
	let sourcePath;
	try {
		sourcePath = resolve(env.src, position.source);
		return readFileSync(sourcePath, 'utf-8').split('\n');
	} catch (err) {
		try {
			sourcePath = resolve(env.cwd, position.source);
			return readFileSync(sourcePath, 'utf-8').split('\n');
		} catch (err) {
			error(`Unable to read file: ${sourcePath} (${position.source})\n`);
		}
	}
}

async function handlePrerenderError(err, env, stack, entry) {
	const errorMessage = err.toString();
	const isReferenceError = errorMessage.startsWith('ReferenceError');
	const methodName = stack.getMethodName();
	const fileName = stack.getFileName().replace(/\\/g, '/');

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
			const sourceMapContent = JSON.parse(
				readFileSync(`${entry}.map`, 'utf-8')
			);

			await SourceMapConsumer.with(sourceMapContent, null, consumer => {
				position = consumer.originalPositionFor({
					line: stack.getLineNumber(),
					column: stack.getColumnNumber(),
				});
			});
		} catch (err) {
			error(`Unable to read sourcemap: ${entry}.map`);
		}
	}

	if (position) {
		info(JSON.stringify(position));
		position.source = position.source
			.replace('webpack://', '.')
			.replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) =>
				require
					.resolve(name)
					.replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1')
			);
	} else {
		position = {
			source: stack.getFileName(),
			line: stack.getLineNumber(),
			column: stack.getColumnNumber(),
		};
	}

	const sourceLines = getLines(env, position);

	let sourceCodeHighlight = sourceLines
		? codeFrameColumns(
				sourceLines.join('\n'),
				{ start: { line: position.line, column: position.column } },
				{ highlightCode: true }
		  )
		: '';

	const stderr = process.stderr.write.bind(process.stderr);

	stderr('\n');
	stderr(outdent`
		[PrerenderError]: ${red(`${errorMessage}`)}
		  --> ${position.source}:${position.line}:${position.column} (${methodName ||
		'<anonymous>'})
		${sourceCodeHighlight}

		${red(`${err.stack}`)}
		
		This ${
			isReferenceError ? 'is most likely' : 'could be'
		} caused by using DOM or Web APIs.
		Pre-render runs in node and has no access to globals available in browsers.
		Consider wrapping code producing error in: 'if (typeof window !== "undefined") { ... }\
		${
			methodName === 'componentWillMount'
				? `\nor place logic in 'componentDidMount' method.`
				: ''
		}
		
		Alternatively use \`preact build --no-prerender\` to disable prerendering.
		See https://github.com/developit/preact-cli#pre-rendering for further information.
	`);
	process.exit(1);
}
