const { access, copyFile } = require('fs/promises');

const spawn = require('cross-spawn-promise');
const { blue, red, yellow } = require('kleur/colors');

exports.copyTemplateFile = async function copyTemplateFile(
	srcPath,
	destPath,
	force
) {
	try {
		await access(destPath);
		if (force) {
			await copyFile(srcPath, destPath);
		}
	} catch {
		await copyFile(srcPath, destPath);
	}
};

/**
 * @param {string} cwd
 * @param {'yarn' | 'npm'} packageManager
 */
exports.installDependencies = async function installDependencies(
	cwd,
	packageManager
) {
	await spawn(packageManager, ['install'], { cwd, stdio: 'inherit' });
};

/**
 * @param {string} cwd
 */
exports.initGit = async function initGit(cwd) {
	await spawn('git', ['init'], { cwd });
};

exports.info = function (text) {
	process.stderr.write(`${blue(text)}`);
};

exports.error = function error(text, code = 1) {
	process.stderr.write(`${red(text)}\n`);
	code && process.exit(code);
};

exports.warn = function warn(text) {
	process.stdout.write(`${yellow(text)}\n`);
};
