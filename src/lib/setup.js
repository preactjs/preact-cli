import spawn from 'cross-spawn-promise';
import { hasCommand, warn } from '../util';

export function install(cwd, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm';
	return spawn(cmd, ['install'], { cwd, stdio:'ignore' });
}

export function pkgScripts(pkg, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm run';
	return {
		...(pkg.scripts || {}),
		start: `if-env NODE_ENV=production && ${cmd} -s serve || ${cmd} -s dev`,
		build: 'preact build',
		serve: 'preact build && preact serve',
		dev: 'preact watch',
		test: 'eslint src && preact test'
	};
}

// Initializes the folder using `git init` and a proper `.gitignore` file
// if `git` is present in the $PATH.
export async function initGit(target) {
	let git = hasCommand('git');

	if (git) {
		const cwd = target;

		await spawn('git', ['init'], { cwd });
		await spawn('git', ['add', '-A'], { cwd });

		let gitUser, gitEmail;
		const defaultGitUser = 'Preact CLI';
		const defaultGitEmail = 'developit@users.noreply.github.com';

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
	} else {
		warn('Could not locate `git` binary in `$PATH`. Skipping!');
	}
}
