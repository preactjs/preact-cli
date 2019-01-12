const HOOKS = [
	{
		test: /^total precache size /i,
		handler: text => `\n  \u001b[32m${text}\u001b[39m`,
	},
];

function wrap(stream, handler) {
	let write = stream.write;
	stream.write = text => write.call(stream, handler(text));
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
