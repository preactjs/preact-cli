const { resolve } = require('path');

const output = resolve(__dirname, '../output');

function tmpDir() {
	let str = Math.random()
		.toString(36)
		.replace(/[^a-z]+/g, '')
		.substr(0, 12);
	return resolve(output, str);
}

module.exports = { tmpDir };
