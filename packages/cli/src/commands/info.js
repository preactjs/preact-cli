const envinfo = require('envinfo');

exports.info = async function infoCommand() {
	const info = await envinfo.run({
		System: ['OS', 'CPU'],
		Binaries: ['Node', 'Yarn', 'npm'],
		Browsers: ['Chrome', 'Edge', 'Firefox', 'Safari'],
		npmPackages: [
			'preact',
			'preact-cli',
			'preact-router',
			'preact-render-to-string',
		],
		npmGlobalPackages: ['preact-cli'],
	});

	process.stdout.write(`\nEnvironment Info:${info}\n`);
};
