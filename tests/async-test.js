import test from 'tape';

const defaultTestTimeout = 120 * 1000;

const asyncTest = (...args) => {
	let { fn, tapeArgs, hasTimeout } = parseArgs(args);

	test(...tapeArgs, (t) => {
		if (!hasTimeout) t.timeoutAfter(defaultTestTimeout);
		fn(t)
			.then(() => t.end())
			.catch(e => t.end(e));
	});
};

asyncTest.only = (...args) => {
	let { fn, tapeArgs, hasTimeout } = parseArgs(args);

	test.only(...tapeArgs, t => {
		if (!hasTimeout) t.timeoutAfter(defaultTestTimeout);
		fn(t)
			.then(() => t.end())
			.catch(e => t.end(e));
	});
};

export default asyncTest;

const parseArgs = args => {
	let fn = args[args.length - 1];
	let tapeArgs = args.slice(0, args.length - 1);
	let opts = tapeArgs[1];

	return {
		fn,
		tapeArgs,
		hasTimeout: opts && opts.timeout !== undefined
	};
};
