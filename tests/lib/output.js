const copy = require('ncp');
const uuid = require('uuid/v4');
const { resolve } = require('path');
const { promisify } = require('bluebird');

const output = resolve(__dirname, '../output');
const subjects = resolve(__dirname, '../subjects');

function tmpDir() {
	return resolve(output, uuid());
}

async function subject(name) {
	let src = resolve(subjects, name);
	let dest = tmpDir();
	await promisify(copy)(src, dest);
	return dest;
}

module.exports = { tmpDir, subject };
