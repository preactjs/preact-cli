import path from 'path';
import fs from 'fs.promised';
import spawn from 'cross-spawn-promise';
import { hasCommand } from '../util';

export function initialize(cwd, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm';
	return spawn(cmd, ['init', '-y'], { cwd, stdio:'ignore' });
}

export async function install(yarn, cwd, packages, env) {
	let isDev = env === 'dev' ? true : false;
	let isYarnAvailable = hasCommand('yarn');
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
}

export function pkgScripts(yarn, pkg) {
	let isYarnAvailable = hasCommand('yarn');

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
}

export const trimLeft = str => str.trim().replace(/^\t+/gm, '');

// Initializes the folder using `git init` and a proper `.gitignore` file
// if `git` is present in the $PATH.
export async function initGit(target) {
	let git = hasCommand('git');

	if (!git) {
		process.stderr.write('Could not find git in $PATH.\n');
		process.stdout.write('Continuing without initializing version control...\n');
	}

	if (git) {
		const gitignore = trimLeft(`
		node_modules
		/build
		/*.log
		`) + '\n';
		const gitignorePath = path.resolve(target, '.gitignore');
		await fs.writeFile(gitignorePath, gitignore);

		const cwd = target;

		await spawn('git', ['init'], { cwd });
		await spawn('git', ['add', '-A'], { cwd });

		const defaultGitEmail = 'developit@users.noreply.github.com';
		const defaultGitUser = 'Preact CLI';
		let gitUser;
		let gitEmail;

		try {
			gitEmail = (await spawn('git', ['config', 'user.email'])).toString();
		} catch (e) {
			gitEmail = defaultGitEmail;
		}

		try {
			gitUser = (await spawn('git', ['config', 'user.name'])).toString();
		} catch (e) {
			gitUser = defaultGitUser;
		}

		await spawn('git', ['commit', '-m', 'initial commit from Preact CLI'], {
			cwd,
			env: {
				GIT_COMMITTER_NAME: gitUser,
				GIT_COMMITTER_EMAIL: gitEmail,
				GIT_AUTHOR_NAME: defaultGitUser,
				GIT_AUTHOR_EMAIL: defaultGitEmail
			}
		});
	}
}
