const ora = require('ora');
const glob = require('glob');
const gittar = require('gittar');
const fs = require('fs.promised');
const { green } = require('chalk');
const { resolve } = require('path');
const { prompt } = require('inquirer');
const { promisify } = require('bluebird');
const isValidName = require('validate-npm-package-name');
const { info, isDir, hasCommand, error, trim, warn } = require('../util');
const { addScripts, install, initGit, isMissing } = require('../lib/setup');

const ORG = 'preactjs-templates';
const RGX = /\.(woff2?|ttf|eot|jpe?g|ico|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i;
const isMedia = str => RGX.test(str);
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);

module.exports = async function(repo, dest, argv) {
	// Prompt if incomplete data
	if (!repo || !dest) {
		warn('Insufficient arguments! Prompting...');
		info('Alternatively, run `preact create --help` for usage info.');

		let questions = isMissing(argv);
		let response = await prompt(questions);

		Object.assign(argv, response);
		repo = repo || response.template;
		dest = dest || response.dest;
	}

	let cwd = resolve(argv.cwd);
	let target = resolve(cwd, dest);
	let isYarn = argv.yarn && hasCommand('yarn');
	let exists = isDir(target);

	if (exists && !argv.force) {
		return error(
			'Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag',
			1
		);
	}

	if (exists && argv.force) {
		let { enableForce } = await prompt({
			type: 'confirm',
			name: 'enableForce',
			message: `You are using '--force'. Do you wish to continue?`,
			default: false,
		});

		if (enableForce) {
			info('Initializing project in the current directory!');
		} else {
			return error('Refusing to overwrite current directory!', 1);
		}
	}

	// Use `--name` value or `dest` dir's name
	argv.name = argv.name || dest;

	let { errors } = isValidName(argv.name);
	if (errors) {
		errors.unshift(`Invalid package name: ${argv.name}`);
		return error(errors.map(capitalize).join('\n  ~ '), 1);
	}

	if (!repo.includes('/')) {
		repo = `${ORG}/${repo}`;
		info(`Assuming you meant ${repo}...`);
	}

	// Attempt to fetch the `template`
	let archive = await gittar.fetch(repo).catch(err => {
		err = err || { message: 'An error occured while fetching template.' };
		return error(
			err.code === 404 ? `Could not find repository: ${repo}` : err.message,
			1
		);
	});

	let spinner = ora({
		text: 'Creating project',
		color: 'magenta',
	}).start();

	// Extract files from `archive` to `target`
	// TODO: read & respond to meta/hooks
	let keeps = [];
	await gittar.extract(archive, target, {
		strip: 2,
		filter(path, obj) {
			if (path.includes('/template/')) {
				obj.on('end', () => {
					if (obj.type === 'File' && !isMedia(obj.path)) {
						keeps.push(obj.absolute);
					}
				});
				return true;
			}
		},
	});

	if (keeps.length) {
		// eslint-disable-next-line
		let dict = new Map();
		// TODO: concat author-driven patterns
		['name'].forEach(str => {
			// if value is defined
			if (argv[str] !== void 0) {
				dict.set(new RegExp(`{{\\s?${str}\\s}}`, 'g'), argv[str]);
			}
		});
		// Update each file's contents
		let buf,
			entry,
			enc = 'utf8';
		for (entry of keeps) {
			buf = await fs.readFile(entry, enc);
			dict.forEach((v, k) => {
				buf = buf.replace(k, v);
			});
			await fs.writeFile(entry, buf, enc);
		}
	} else {
		return error(`No \`template\` directory found within ${repo}!`, 1);
	}

	spinner.text = 'Parsing `package.json` file';

	// Validate user's `package.json` file
	let pkgData,
		pkgFile = resolve(target, 'package.json');

	if (pkgFile) {
		pkgData = JSON.parse(await fs.readFile(pkgFile));
		// Write default "scripts" if none found
		pkgData.scripts =
			pkgData.scripts || (await addScripts(pkgData, target, isYarn));
	} else {
		warn('Could not locate `package.json` file!');
	}

	// Update `package.json` key
	if (pkgData) {
		spinner.text = 'Updating `name` within `package.json` file';
		pkgData.name = argv.name.toLowerCase().replace(/\s+/g, '_');
	}
	// Find a `manifest.json`; use the first match, if any
	let files = await promisify(glob)(target + '/**/manifest.json');
	let manifest = files[0] && JSON.parse(await fs.readFile(files[0]));
	if (manifest) {
		spinner.text = 'Updating `name` within `manifest.json` file';
		manifest.name = manifest.short_name = argv.name;
		// Write changes to `manifest.json`
		await fs.writeFile(files[0], JSON.stringify(manifest, null, 2));
		if (argv.name.length > 12) {
			// @see https://developer.chrome.com/extensions/manifest/name#short_name
			process.stdout.write('\n');
			warn('Your `short_name` should be fewer than 12 characters.');
		}
	}

	if (pkgData) {
		// Assume changes were made ¯\_(ツ)_/¯
		await fs.writeFile(pkgFile, JSON.stringify(pkgData, null, 2));
	}

	if (argv.install) {
		spinner.text = 'Installing dependencies';
		await install(target, isYarn);
	}

	spinner.succeed('Done!\n');

	if (argv.git) {
		await initGit(target);
	}

	let pfx = isYarn ? 'yarn' : 'npm run';

	return (
		trim(`
		To get started, cd into the new directory:
			${green('cd ' + dest)}

		To start a development live-reload server:
			${green(pfx + ' start')}

		To create a production build (in ./build):
			${green(pfx + ' build')}

		To start a production HTTP/2 server:
			${green(pfx + ' serve')}
	`) + '\n'
	);
};
