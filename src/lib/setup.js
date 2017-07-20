import path from 'path';
import fs from 'fs.promised';
import spawn from 'cross-spawn-promise';
import { commandExists } from './shell';

const initialize = async (yarn, cwd) => {
	let isYarnAvailable = await commandExists('yarn');

	if (isYarnAvailable && yarn) {
		return await spawn('yarn', ['init', '-y'], { cwd, stdio: 'ignore' });
	}

	await spawn('npm', ['init', '-y'], { cwd, stdio: 'ignore' });
};

const install = async (yarn, cwd, packages, env) => {
	let isDev = env === 'dev' ? true : false;
	let isYarnAvailable = await commandExists('yarn');
	let toInstall = packages.filter(Boolean);

	// pass null to use yarn only if yarn.lock is present
	if (!yarn) {
		try {
			let stat = await fs.stat(path.resolve(cwd, 'yarn.lock'));
			yarn = stat.isFile();
		}
		catch (e) { yarn = false; }
	}

	if (isYarnAvailable && yarn) {
		let args = ['add'];
		if (isDev) {
			args.push('-D');
		}

		return await spawn('yarn', [...args, ...toInstall], { cwd, stdio: 'ignore' });
	}

	await spawn('npm', ['install', isDev ? '--save-dev' : '--save', ...toInstall], { cwd, stdio: 'ignore' });
};

const pkgScripts = async (yarn, pkg) => {
	let isYarnAvailable = await commandExists('yarn');

	if (isYarnAvailable && yarn) {
		return {
			...(pkg.scripts || {}),
			start: 'if-env NODE_ENV=production && yarn run -s serve || yarn run -s dev',
			build: 'preact build',
			serve: 'preact build && preact serve',
			dev: 'preact watch',
			test: 'eslint src && preact test'
		};
	}

	return {
		...(pkg.scripts || {}),
		start: 'if-env NODE_ENV=production && npm run -s serve || npm run -s dev',
		build: 'preact build',
		serve: 'preact build && preact serve',
		dev: 'preact watch',
		test: 'eslint src && preact test'
	};
};

export { install, initialize, pkgScripts };
