'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = prerender;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _path = require('path');

var _fs = require('fs');

var _stackTrace = require('stack-trace');

var _stackTrace2 = _interopRequireDefault(_stackTrace);

var _sourceMap = require('source-map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function prerender(env, params) {
	params = params || {};

	let entry = (0, _path.resolve)(env.dest, './ssr-build/ssr-bundle.js');
	let url = params.url || '/';

	global.history = {};
	global.location = { href: url, pathname: url };

	try {
		let m = require(entry),
		    app = m && m.default || m;

		if (typeof app !== 'function') {
			console.warn('Entry does not export a Component function/class, aborting prerendering.');
			return '';
		}

		let preact = require('preact'),
		    renderToString = require('preact-render-to-string');

		return renderToString(preact.h(app, _extends({}, params, { url })));
	} catch (err) {
		let stack = _stackTrace2.default.parse(err).filter(s => s.getFileName() === entry)[0];
		if (!stack) {
			throw err;
		}

		handlePrerenderError(err, env, stack, entry);
	}
}

const handlePrerenderError = (err, env, stack, entry) => {
	let errorMessage = err.toString();
	let isReferenceError = errorMessage.startsWith('ReferenceError');
	let methodName = stack.getMethodName();
	let sourceMapContent, position, sourcePath, sourceLines, sourceCodeHighlight;

	try {
		sourceMapContent = JSON.parse((0, _fs.readFileSync)(`${entry}.map`));
	} catch (err) {
		process.stderr.write(_chalk2.default.red(`Unable to read sourcemap: ${entry}.map\n`));
	}

	if (sourceMapContent) {
		let sourceMapConsumer = new _sourceMap.SourceMapConsumer(sourceMapContent);
		position = sourceMapConsumer.originalPositionFor({
			line: stack.getLineNumber(),
			column: stack.getColumnNumber()
		});

		position.source = position.source.replace('webpack://', '.').replace(/^.*~\/((?:@[^/]+\/)?[^/]+)/, (s, name) => require.resolve(name).replace(/^(.*?\/node_modules\/(@[^/]+\/)?[^/]+)(\/.*)$/, '$1'));

		sourcePath = (0, _path.resolve)(env.src, position.source);
		sourceLines;
		try {
			sourceLines = (0, _fs.readFileSync)(sourcePath, 'utf-8').split('\n');
		} catch (err) {
			try {
				sourceLines = (0, _fs.readFileSync)(require.resolve(position.source), 'utf-8').split('\n');
			} catch (err) {
				process.stderr.write(_chalk2.default.red(`Unable to read file: ${sourcePath}\n`));
			}
		}
		sourceCodeHighlight = '';

		if (sourceLines) {
			for (var i = -4; i <= 4; i++) {
				let color = i === 0 ? _chalk2.default.red : _chalk2.default.yellow;
				let line = position.line + i;
				let sourceLine = sourceLines[line - 1];
				sourceCodeHighlight += sourceLine ? `${color(sourceLine)}\n` : '';
			}
		}
	}

	process.stderr.write('\n');
	process.stderr.write(_chalk2.default.red(`${errorMessage}\n`));
	process.stderr.write(`method: ${methodName}\n`);
	if (sourceMapContent) {
		process.stderr.write(`at: ${sourcePath}:${position.line}:${position.column}\n`);
		process.stderr.write('\n');
		process.stderr.write('Source code:\n\n');
		process.stderr.write(sourceCodeHighlight);
		process.stderr.write('\n');
	} else {
		process.stderr.write(stack.toString() + '\n');
	}
	process.stderr.write(`This ${isReferenceError ? 'is most likely' : 'could be'} caused by using DOM or Web APIs.\n`);
	process.stderr.write(`Pre-render runs in node and has no access to globals available in browsers.\n\n`);
	process.stderr.write(`Consider wrapping code producing error in: 'if (typeof window !== "undefined") { ... }'\n`);

	if (methodName === 'componentWillMount') {
		process.stderr.write(`or place logic in 'componentDidMount' method.\n`);
	}
	process.stderr.write('\n');
	process.stderr.write(`Alternatively use 'preact build --no-prerender' to disable prerendering.\n\n`);
	process.stderr.write('See https://github.com/developit/preact-cli#pre-rendering for further information.');
	process.exit(1);
};