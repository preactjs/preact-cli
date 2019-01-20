const HOOKS = [
	{
		test: /^total precache size /i,
		handler: text => `\n  \u001b[32m${text}\u001b[39m`,
	},
	{
		test: /DeprecationWarning/,
		handler: () => false
	}
];

function wrap(stream, handler) {
	let write = stream.write;
	stream.write = text => {
		const transformed = handler(text);
		if (transformed === false) return;
		return write.call(stream, transformed);
	};
	return () => {
		stream.write = write;
	};
}

function invokeHooks(text) {
	for (let i = HOOKS.length; i--; ) {
		let hook = HOOKS[i];
		if (hook.test.test(text)) {
			text = hook.handler(text);
		}
	}
	return text;
}

module.exports = function() {
	let out = wrap(process.stdout, invokeHooks),
		err = wrap(process.stderr, invokeHooks);
	return () => {
		out();
		err();
	};
};
