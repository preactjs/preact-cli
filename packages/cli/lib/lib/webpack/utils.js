function isInstalledVersionPreactXOrAbove(cwd) {
	try {
		return (
			parseInt(
				require(require.resolve('preact/package.json', { paths: [cwd] }))
					.version,
				10
			) >= 10
		);
	} catch (e) {}
	return false;
}

module.exports = {
	isInstalledVersionPreactXOrAbove,
};
