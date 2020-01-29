const resolveFrom = require('resolve-from');

function isInstalledVersionPreactXOrAbove(cwd) {
	try {
		return (
			parseInt(require(resolveFrom(cwd, 'preact/package.json')).version, 10) >=
			10
		);
	} catch (e) {}
	return false;
}

module.exports = {
	isInstalledVersionPreactXOrAbove,
};
