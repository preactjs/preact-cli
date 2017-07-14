import { join } from 'path';

const minimumSizeDifference = 10;
const percentageThreshold = 0.05;
const minimumFileSize = 1;

export default (actual, expected) => {
	let normalizedExpected = normalize(expected);
	let normalizedActual = normalize(actual);

	let expectedBoundaries = Object.keys(normalizedExpected)
		.reduce((acc, path) => Object.assign(acc, {
			[path]: {
				min: boundary('down', normalizedExpected[path].size),
				max: boundary('up', normalizedExpected[path].size)
			}
		}), {});

	let comparisonResult = Object.keys(normalizedActual).reduce((acc, path) => {
		let expectedValues = expectedBoundaries[path];
		let actualValue = normalizedActual[path].size;

		if (expectedValues && expectedValues.min <= actualValue && actualValue <= expectedValues.max) {
			return Object.assign(acc, { [path]: expectedValues });
		}

		return Object.assign(acc, { [path]: actualValue });
	}, {});

	expect(comparisonResult).toEqual(expectedBoundaries);
};

const boundary = (direction, val) => {
	let round = direction === 'up' ? Math.ceil : Math.floor;
	let rounded = Math.max(minimumSizeDifference, round(val * percentageThreshold));
	rounded = direction === 'up' ? rounded : -rounded;
	return Math.max(minimumFileSize, val + rounded);
};

const normalize = obj => {
	let flat = flatten(obj, o => Object.keys(o).length === 1 && typeof o.size === 'number');

	return Object.keys(flat).reduce((agg, key) => {
		let newKey = key.replace(/\.chunk\.\w+\./, '.chunk.*.');
		agg[newKey] = flat[key];
		return agg;
	}, {});
};

const flatten = (obj, stop, path = '') => Object.keys(obj)
	.reduce((agg, key) => {
		let combinedPath = path.length ? join(path, key) : key;

		if (stop(obj[key])) {
			agg[combinedPath] = obj[key];
			return agg;
		}

		let flat = flatten(obj[key], stop, combinedPath);

		Object.keys(flat).forEach(path => {
			agg[path] = flat[path];
		});
		return agg;
	}, {});

