const { resolve } = require('path');
const { existsSync } = require('fs');

function isInstalledVersionPreactXOrAbove(cwd) {
	const pathToPreact = resolve(cwd, 'node_modules', 'preact');
	// By default the setup is for Preact X.
	if (!existsSync(pathToPreact)) {
		return true;
	}

	const pathToPackage = resolve(pathToPreact, 'package.json');
	const { version: preactVersionString } = require(pathToPackage);
	return (
		parseInt(preactVersionString.substr(0, preactVersionString.indexOf('.'))) >=
		10
	);
}

module.exports = {
	isInstalledVersionPreactXOrAbove,
};
