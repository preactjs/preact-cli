const { resolve } = require('path');

function isInstalledVersionPreactXOrAbove(src) {
	const { version: preactVersionString } = require(resolve(
		src,
		'..',
		'node_modules',
		'preact',
		'package.json'
	));
	return (
		parseInt(preactVersionString.substr(0, preactVersionString.indexOf('.'))) >=
		10
	);
}

module.exports = {
	isInstalledVersionPreactXOrAbove,
};
