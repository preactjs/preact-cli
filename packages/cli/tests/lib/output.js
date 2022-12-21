const { mkdir } = require('fs/promises');
const copy = require('ncp');
const { resolve } = require('path');
const { promisify } = require('util');

const output = resolve(__dirname, '../output');
const subjects = resolve(__dirname, '../subjects');

async function tmpDir() {
	let str = Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substring(0, 12);
	await mkdir(output, { recursive: true });
	return resolve(output, str);
}

async function subject(name) {
	let src = resolve(subjects, name);
	let dest = await tmpDir();
	await promisify(copy)(src, dest);
	return dest;
}

module.exports = { tmpDir, subject };
