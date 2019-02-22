'use strict';

exports.__esModule = true;

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _glob = require('glob');

var _glob2 = _interopRequireDefault(_glob);

var _gittar = require('gittar');

var _gittar2 = _interopRequireDefault(_gittar);

var _fs = require('fs.promised');

var _fs2 = _interopRequireDefault(_fs);

var _chalk = require('chalk');

var _inquirer = require('inquirer');

var _path = require('path');

var _validateNpmPackageName = require('validate-npm-package-name');

var _validateNpmPackageName2 = _interopRequireDefault(_validateNpmPackageName);

var _util = require('../util');

var _setup = require('./../lib/setup');

var _asyncCommand = require('../lib/async-command');

var _asyncCommand2 = _interopRequireDefault(_asyncCommand);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const ORG = 'preactjs-templates';
const RGX = /\.(woff2?|ttf|eot|jpe?g|ico|png|gif|mp4|mov|ogg|webm)(\?.*)?$/i;
const isMedia = str => RGX.test(str);
const capitalize = str => str.charAt(0).toUpperCase() + str.substring(1);

exports.default = (0, _asyncCommand2.default)({
	command: 'create [template] [dest]',

	desc: 'Create a new application.',

	builder: {
		cwd: {
			description: 'A directory to use instead of $PWD.',
			default: '.'
		},
		name: {
			description: 'The application\'s name'
		},
		force: {
			description: 'Force option to create the directory for the new app',
			default: false
		},
		yarn: {
			description: "Use 'yarn' instead of 'npm'",
			type: 'boolean',
			default: false
		},
		git: {
			description: 'Initialize version control using git',
			type: 'boolean',
			default: false
		},
		install: {
			description: 'Install dependencies',
			type: 'boolean',
			default: true
		}
	},

	handler(argv) {
		return _asyncToGenerator(function* () {
			if (!argv.dest || !argv.template) {
				(0, _util.warn)('Insufficient command arguments! Prompting...');
				(0, _util.info)('Alternatively, run `preact create --help` for usage info.');

				let questions = (0, _setup.isMissing)(argv);
				let response = yield (0, _inquirer.prompt)(questions);
				Object.assign(argv, response);
			}

			let cwd = (0, _path.resolve)(argv.cwd);
			argv.dest = argv.dest || (0, _path.dirname)(cwd);
			let isYarn = argv.yarn && (0, _util.hasCommand)('yarn');
			let target = (0, _path.resolve)(cwd, argv.dest);
			let exists = (0, _util.isDir)(target);

			if (exists && !argv.force) {
				return (0, _util.error)('Refusing to overwrite current directory! Please specify a different destination or use the `--force` flag', 1);
			}

			if (exists && argv.force) {
				var _ref = yield (0, _inquirer.prompt)({
					type: 'confirm',
					name: 'enableForce',
					message: `You are using '--force'. Do you wish to continue?`,
					default: false
				});

				let enableForce = _ref.enableForce;


				if (enableForce) {
					(0, _util.info)('Initializing project in the current directory!');
				} else {
					return (0, _util.error)('Refusing to overwrite current directory!', 1);
				}
			}

			let repo = argv.template;
			if (!repo.includes('/')) {
				repo = `${ORG}/${repo}`;
				(0, _util.info)(`Fetching ${argv.template} template from ${repo}...`);
			}

			argv.name = argv.name || argv.dest;

			var _isValidName = (0, _validateNpmPackageName2.default)(argv.name);

			let errors = _isValidName.errors;

			if (errors) {
				errors.unshift(`Invalid package name: ${argv.name}`);
				return (0, _util.error)(errors.map(capitalize).join('\n  ~ '), 1);
			}

			let archive = yield _gittar2.default.fetch(repo).catch(function (err) {
				err = err || { message: 'An error occured while fetching template.' };
				return (0, _util.error)(err.code === 404 ? `Could not find repository: ${repo}` : err.message, 1);
			});

			let spinner = (0, _ora2.default)({
				text: 'Creating project',
				color: 'magenta'
			}).start();

			let keeps = [];
			yield _gittar2.default.extract(archive, target, {
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
				}
			});

			if (keeps.length) {
				let dict = new Map();

				['name'].forEach(function (str) {
					if (argv[str] !== void 0) {
						dict.set(new RegExp(`{{\\s?${str}\\s}}`, 'g'), argv[str]);
					}
				});

				let buf,
				    entry,
				    enc = 'utf8';
				for (var _iterator = keeps, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
					if (_isArray) {
						if (_i >= _iterator.length) break;
						entry = _iterator[_i++];
					} else {
						_i = _iterator.next();
						if (_i.done) break;
						entry = _i.value;
					}

					buf = yield _fs2.default.readFile(entry, enc);
					dict.forEach(function (v, k) {
						buf = buf.replace(k, v);
					});
					yield _fs2.default.writeFile(entry, buf, enc);
				}
			} else {
				return (0, _util.error)(`No \`template\` directory found within ${repo}!`, 1);
			}

			spinner.text = 'Parsing `package.json` file';

			let pkgData,
			    pkgFile = (0, _path.resolve)(target, 'package.json');

			if (pkgFile) {
				pkgData = JSON.parse((yield _fs2.default.readFile(pkgFile)));

				pkgData.scripts = pkgData.scripts || (yield (0, _setup.addScripts)(pkgData, target, isYarn));
			} else {
				(0, _util.warn)('Could not locate `package.json` file!');
			}

			if (pkgData) {
				spinner.text = 'Updating `name` within `package.json` file';
				pkgData.name = argv.name.toLowerCase().replace(/\s+/g, '_');
			}

			let files = yield Promise.promisify(_glob2.default)(target + '/**/manifest.json');
			let manifest = files[0] && JSON.parse((yield _fs2.default.readFile(files[0])));
			if (manifest) {
				spinner.text = 'Updating `name` within `manifest.json` file';
				manifest.name = manifest.short_name = argv.name;

				yield _fs2.default.writeFile(files[0], JSON.stringify(manifest, null, 2));
				if (argv.name.length > 12) {
					process.stdout.write('\n');
					(0, _util.warn)('Your `short_name` should be fewer than 12 characters.');
				}
			}

			if (pkgData) {
				yield _fs2.default.writeFile(pkgFile, JSON.stringify(pkgData, null, 2));
			}

			if (argv.install) {
				spinner.text = 'Installing dependencies';
				yield (0, _setup.install)(target, isYarn);
			}

			spinner.succeed('Done!\n');

			if (argv.git) {
				yield (0, _setup.initGit)(target);
			}

			let pfx = isYarn ? 'yarn' : 'npm run';

			return (0, _util.trim)(`
			To get started, cd into the new directory:
			  ${(0, _chalk.green)('cd ' + argv.dest)}

			To start a development live-reload server:
			  ${(0, _chalk.green)(pfx + ' start')}

			To create a production build (in ./build):
			  ${(0, _chalk.green)(pfx + ' build')}

			To start a production HTTP/2 server:
			  ${(0, _chalk.green)(pfx + ' serve')}
		`) + '\n';
		})();
	}
});