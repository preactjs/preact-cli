import { join } from 'path';
import { Minimatch } from 'minimatch';

const minimumSizeDifference = 10;
const percentageThreshold = 0.05;
const minimumFileSize = 1;

export default (actual, expected) => {
	let normalizedExpected = normalize(expected);
	let normalizedActual = normalize(actual);

	let expectedPaths = Object.keys(normalizedExpected).map(p => new Minimatch(p));
	let expectedBoundaries = Object.keys(normalizedExpected)
		.reduce((acc, path) => Object.assign(acc, {
			[path]: {
				min: boundary('down', normalizedExpected[path].size),
				max: boundary('up', normalizedExpected[path].size)
			}
		}), {});

	let comparisonResult = Object.keys(normalizedActual).reduce((acc, path) => {
		let expectedFilePaths = expectedPaths.filter(p => p.match(path)).map(p => p.pattern);

		if (expectedFilePaths > 1) {
			throw new Error(`Invalid snapshot configuration!
				Found duplicate matches for path: ${path}.
				Mathes: ${expectedFilePaths.join(',')}
			`);
		}
		let expectedPath = expectedFilePaths[0];
		let expectedValues = expectedBoundaries[expectedPath];
		let actualValue = normalizedActual[path].size;

		if (expectedValues && expectedValues.min <= actualValue && actualValue <= expectedValues.max) {
			return Object.assign(acc, { [expectedPath]: expectedValues });
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

const normalize = obj => flatten(obj, o => Object.keys(o).length === 1 && typeof o.size === 'number');

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

