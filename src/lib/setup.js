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
			start: 'if-env NODE_ENV=production && yarnpkg -s serve || yarnpkg -s dev',
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
