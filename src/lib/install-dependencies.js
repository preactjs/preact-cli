import spawn from 'cross-spawn-promise';
import { commandExists } from './shell';

const install = async (cwd, packages, env) => {
	let isDev = env === 'dev' ? true : false;
	let isYarnAvailable = await commandExists('yarn');
	let toInstall = packages.filter(Boolean);

	if (isYarnAvailable) {
		let args = ['add'];
		if (isDev) {
			args.push('-D');
		}

		return await spawn('yarn', [...args, ...toInstall], { cwd, stdio: 'ignore' });
	}

	await spawn('npm', ['install', isDev ? '--save-dev' : '--save', ...toInstall], { cwd, stdio: 'ignore' });
};

export default install;
