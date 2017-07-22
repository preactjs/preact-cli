import loaderUtils from 'loader-utils';
import fs from 'fs';
import path from 'path';
import { install } from './../setup';

/**
 * This is a pass-through loader that runs `npm install --save` for the specified dependencies when invoked.
 * Chain it before loaders to conditionally install them on first use.
 * Quickly checks if any modules are alread installed and skips them.
 * @param {object} options
 * @param {boolean|string} [options.save=false]  If `true`, runs `npm i --save`. If `"dev"`, runs `npm i --save-dev`.
 * @param {Array<String>|String} modules         A list of modules to install.
 *
 * @example // Install and use less-loader and less when encountering `.less` files:
 *
 * 	use: [
 * 		{
 * 			loader: 'install-loader',
 * 			options: {
 * 				modules: ['less-loader', 'less']
 * 			}
 * 		},
 * 		{
 * 			loader: 'less-loader'
 * 		}
 * 	]
 */


const CACHE = {};

function isInstalled(dep) {
	return CACHE[dep] || (CACHE[dep] = new Promise( resolve => {
		fs.stat(path.resolve('node_modules', dep), err => {
			resolve(!err);
		});
	}));
}

function installDeps(deps, save) {
	process.stdout.write(`\nInstalling ${deps.join(' ')}..`);
	return install(false, process.cwd(), deps, save).then( () => {
		process.stdout.write(` ..${deps.length} installed.\n`);
	});
}

module.exports = function(source, map) {
	let query = loaderUtils.getOptions(this) || {};

	let deps = query.modules;
	if (typeof deps==='string') deps = deps.split(/\s*,\s*/);
	else if (!Array.isArray(deps)) deps = [deps];

	if (!deps.length) return { source, map };

	let callback = this.async();

	Promise.all(deps.map(isInstalled))
		.then( installed => {
			let toInstall = deps.filter( (dep, index) => !installed[index] );
			if (toInstall.length) {
				return installDeps(toInstall, query.save);
			}
		})
		.then( () => callback(null, source, map) )
		.catch( err => callback(`Error installing dependencies: ${err}`) );
};
