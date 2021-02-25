const {
	mkdir,
	mkdirSync,
	readFile,
	writeFile,
	copyFile,
	stat,
	statSync,
	existsSync,
} = require('fs');
const { promisify } = require('util');

module.exports = {
	mkdir: promisify(mkdir),
	mkdirSync,
	copyFile: promisify(copyFile),
	readFile: promisify(readFile),
	writeFile: promisify(writeFile),
	stat: promisify(stat),
	statSync,
	existsSync,
};
