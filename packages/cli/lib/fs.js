const { readFile, writeFile, copyFile, stat, statSync } = require('fs');
const { promisify } = require('util');

module.exports = {
	copyFile: promisify(copyFile),
	readFile: promisify(readFile),
	writeFile: promisify(writeFile),
	stat: promisify(stat),
	statSync,
};
