const { cpus } = require('os');
const resolved = Promise.resolve();
module.exports = async function pool(
	items,
	iteratorFn,
	concurrency = cpus().length
) {
	const itemsLength = items.length;
	const returnable = [];
	const executing = [];
	for (const item of items) {
		const promise = resolved.then(() => iteratorFn(item, items));
		returnable.push(promise);
		if (concurrency <= itemsLength) {
			const execute = promise.then(() =>
				executing.splice(executing.indexOf(execute), 1)
			);
			executing.push(execute);
			if (executing.length >= concurrency) {
				await Promise.race(executing);
			}
		}
	}
	return Promise.all(returnable);
};
