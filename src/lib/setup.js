import spawn from 'cross-spawn-promise';
import { hasCommand, warn } from '../util';

export function install(cwd, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm';
	return spawn(cmd, ['install'], { cwd, stdio:'ignore' });
}

export async function addScripts(obj, cwd, isYarn) {
	let cmd = isYarn ? 'yarn' : 'npm';
	let args = isYarn ? ['add', '--dev'] : ['install', '--save-dev'];

	// Install `if-env`
	await spawn(cmd, [...args, 'if-env'], { cwd, stdio:'ignore '});

	return {
		build: 'preact build',
		serve: 'preact build && preact serve',
		start: `if-env NODE_ENV=production && ${cmd} run -s serve || ${cmd} run -s watch`,
		watch: 'preact watch'
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

// Formulate Questions if `create` args are missing
export function isMissing(argv) {
	let out = [];

	const ask = (name, message, val) => {
		let type = val === void 0 ? 'input' : 'confirm';
		out.push({ name, message, type, default:val });
	};

	// Required data
	!argv.template && ask('template', 'Remote template to clone (user/repo#tag)');
	!argv.dest && ask('dest', 'Directory to create the app');
	// Extra data / flags
	!argv.name && ask('name', 'The application\'s name');
	!argv.force && ask('force', 'Enforce `dest` directory; will overwrite!', false);
	ask('install', 'Install dependencies', true); // defaults `true`, ask anyway
	!argv.yarn && ask('yarn', 'Install with `yarn` instead of `npm`', false);
	!argv.git && ask('git', 'Initialize a `git` repository', false);

	return out;
}
