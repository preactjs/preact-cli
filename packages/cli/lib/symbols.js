const { blue, yellow, red } = require('kleur');

const main = {
	info: blue('ℹ'),
	warning: yellow('⚠'),
	error: red('✖'),
};

var win = {
	info: blue('i'),
	warning: yellow('‼'),
	error: red('×'),
};

module.exports = process.platform === 'win32' ? win : main;
