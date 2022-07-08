const { mkdir, readFile, stat, writeFile } = require('fs/promises');
const { join, resolve } = require('path');

const ora = require('ora');
const gittar = require('gittar');
const { green } = require('kleur/colors');

const {
	copyTemplateFile,
	error,
	initGit,
	installDependencies,
	warn,
} = require('../util.js');

exports.create = async function create(repo, dest, argv) {
	let cwd = resolve(argv.cwd);
	let target = resolve(cwd, dest);
	const packageManager = /yarn/.test(process.env.npm_execpath || '')
		? 'yarn'
		: 'npm';

	try {
		if ((await stat(target)).isDirectory() && !argv.force) {
			error(
				'Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag',
				1
			);
		}
	} catch {}

	// Use `--name` value or `dest` dir's name
	argv.name = argv.name || dest;

	if (!repo.includes('/')) {
		repo = `preactjs-templates/${repo}`;
	}

	await mkdir(resolve(cwd, dest), { recursive: true });

	// Attempt to fetch the template
	let archive = await gittar.fetch(repo).catch(err => {
		err = err || { message: 'An error occured while fetching template.' };

		return error(
			err.code === 404
				? `Could not find repository: ${repo}`
				: (argv.verbose && err.stack) || err.message,
			1
		);
	});

	let spinner = ora({
		text: 'Creating project',
		color: 'magenta',
	}).start();

	// Extract files from `archive` to `target`
	// TODO: read & respond to meta/hooks
	let hasValidStructure = false;
	await gittar.extract(archive, target, {
		strip: 2,
		filter(path) {
			if (path.includes('/template/')) {
				hasValidStructure = true;
				return true;
			}
		},
	});

	if (!hasValidStructure) {
		error(
			`No 'template' directory found within ${repo}! This is necessary for project creation.`,
			1
		);
	}

	try {
		spinner.text = 'Updating `name` within `manifest.json` file';
		const manifestPath = join(target, 'src', 'manifest.json');

		let manifest = JSON.parse(await readFile(manifestPath, 'utf-8'));
		manifest.name = manifest.short_name = argv.name;

		await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
		if (argv.name.length > 12) {
			// @see https://developer.chrome.com/extensions/manifest/name#short_name
			warn('Your `short_name` should be fewer than 12 characters.');
		}
	} catch {}

	if (!repo.includes('widget')) {
		const sourceDirectory = join(resolve(cwd, dest), 'src');

		// Copy over template.html
		const templateSrc = resolve(
			__dirname,
			join('..', 'resources', 'template.html')
		);
		const templateDest = join(sourceDirectory, 'template.html');
		await copyTemplateFile(templateSrc, templateDest, argv.force);

		// Copy over sw.js
		const serviceWorkerSrc = resolve(
			__dirname,
			join('..', 'resources', 'sw.js')
		);
		const serviceWorkerDest = join(sourceDirectory, 'sw.js');
		await copyTemplateFile(serviceWorkerSrc, serviceWorkerDest, argv.force);
	}

	// TODO: Remove when templates are updated
	const packagePath = join(target, 'package.json');
	let packageFile = JSON.parse(await readFile(packagePath, 'utf-8'));
	packageFile.name = 'foo';
	await writeFile(packagePath, JSON.stringify(packageFile, null, 2));

	if (argv.install) {
		spinner.text = 'installing dependencies...';
		spinner.stopAndPersist();
		await installDependencies(target, packageManager);
	}

	if (argv.git) {
		await initGit(target);
	}

	spinner.succeed('Done!\n');

	let pfx = packageManager === 'yarn' ? 'yarn' : 'npm run';

	const result = `
		To get started, cd into the new directory:
		  ${green('cd ' + dest)}

		To start a development live-reload server:
		  ${green(pfx + ' dev')}

		To create a production build (in ./build):
		  ${green(pfx + ' build')}

		To start a production HTTP/2 server:
		  ${green(pfx + ' serve')}
	`;
	process.stdout.write(result.trim().replace(/^\t+/gm, '') + '\n\n');
};
