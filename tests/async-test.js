import test from 'tape';

const testTimeout = 30 * 1000;

const asyncTest = (name, fn) => {
	test(name, (t) => {
		t.timeoutAfter(testTimeout);
		fn(t)
			.then(() => t.end())
			.catch(e => t.end(e));
	});
};

asyncTest.only = (name, fn) => {
	test.only(name, t => {
		t.timeoutAfter(testTimeout);
		fn(t)
			.then(() => t.end())
			.catch(e => t.end(e));
	});
};

export default asyncTest;
