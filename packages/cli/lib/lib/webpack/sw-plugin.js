const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const BabelEsmPlugin = require('babel-esm-plugin');
const { DefinePlugin } = require('webpack');
const fs = require('fs');
const { resolve } = require('path');
const { info } = require('../../util');
class SWBuilderPlugin {
	constructor(config) {
		const { src, brotli, esm } = config;
		this.brotli_ = brotli;
		this.esm_ = esm;
		this.src_ = src;
	}
	apply(compiler) {
		let swSrc = resolve(__dirname, '../sw.js');
		const exists = fs.existsSync(resolve(`${this.src_}/sw.js`));
		if (exists) {
			swSrc = resolve(`${this.src_}/sw.js`);
			info(
				'⚛️ Detected custom sw.js: compiling instead of default Service Worker.'
			);
		} else {
			info('⚛️ No custom sw.js detected: compiling default Service Worker.');
		}
		compiler.hooks.make.tapAsync(
			this.constructor.name,
			(compilation, callback) => {
				const outputOptions = compiler.options;
				const plugins = [
					new DefinePlugin({
						'process.env.ENABLE_BROTLI': this.brotli_,
						'process.env.ES_BUILD': false,
						'process.env.NODE_ENV': 'production',
					}),
				];

				if (this.esm_) {
					plugins.push(
						new BabelEsmPlugin({
							filename: '[name]-esm.js',
							excludedPlugins: ['BabelEsmPlugin', this.constructor.name],
							beforeStartExecution: plugins => {
								plugins.forEach(plugin => {
									if (plugin.constructor.name === 'DefinePlugin') {
										if (!plugin.definitions)
											throw Error(
												'ESM Error:  DefinePlugin found without definitions.'
											);
										plugin.definitions['process.env.ES_BUILD'] = true;
									}
								});
							},
						})
					);
				}

				/**
				 * We are deliberatly not passing plugins in createChildCompiler.
				 * All webpack does with plugins is to call `apply` method on them
				 * with the childCompiler.
				 * But by then we haven't given childCompiler a fileSystem or other options
				 * which a few plugins might expect while execution the apply method.
				 * We do call the `apply` method of all plugins by ourselves later in the code
				 */
				const childCompiler = compilation.createChildCompiler(
					this.constructor.name
				);

				childCompiler.context = compiler.context;
				childCompiler.options = Object.assign({}, outputOptions);
				childCompiler.options.entry = {
					sw: swSrc,
				};
				childCompiler.options.target = 'webworker';
				childCompiler.options.output = Object.assign(
					{},
					childCompiler.options.output,
					{ filename: '[name].js' }
				);
				childCompiler.options.output.filename = '[name].js';
				childCompiler.outputFileSystem = compiler.outputFileSystem;

				// Call the `apply` method of all plugins by ourselves.
				if (Array.isArray(plugins)) {
					for (const plugin of plugins) {
						plugin.apply(childCompiler);
					}
				}

				new SingleEntryPlugin(compiler.context, swSrc, 'sw').apply(
					childCompiler
				);

				compilation.hooks.additionalAssets.tapAsync(
					this.constructor.name,
					childProcessDone => {
						childCompiler.runAsChild((err, entries, childCompilation) => {
							if (!err) {
								compilation.assets = Object.assign(
									childCompilation.assets,
									compilation.assets
								);
							}
							err && compilation.errors.push(err);
							childProcessDone();
						});
					}
				);
				callback();
			}
		);
	}
}

module.exports = SWBuilderPlugin;
