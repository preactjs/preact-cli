const { resolve } = require('path');

function isInstalledVersionPreactXOrAbove(cwd) {
	const pathToPackage = resolve(cwd, 'node_modules', 'preact', 'package.json');
	const { version: preactVersionString } = require(pathToPackage);
	return (
		parseInt(preactVersionString.substr(0, preactVersionString.indexOf('.'))) >=
		10
	);
}

module.exports = {
	isInstalledVersionPreactXOrAbove,
};
