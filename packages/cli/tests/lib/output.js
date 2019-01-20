const copy = require('ncp');
const { resolve } = require('path');
const { promisify } = require('bluebird');

const output = resolve(__dirname, '../output');
const subjects = resolve(__dirname, '../subjects');

function tmpDir() {
	let str = Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 12);
	return resolve(output, str);
}

async function subject(name) {
	let src = resolve(subjects, name);
	let dest = tmpDir();
	await promisify(copy)(src, dest);
	return dest;
}

module.exports = { tmpDir, subject };
