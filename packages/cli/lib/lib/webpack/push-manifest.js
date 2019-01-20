const createLoadManifest = require('./create-load-manifest');

module.exports = class PushManifestPlugin {
	constructor(env = {}) {
		this.isESMBuild_ = env.esm;
	}
	apply(compiler) {
		compiler.plugin('emit', (compilation, callback) => {
			const manifest = createLoadManifest(
				compilation.assets,
				this.isESMBuild_,
				compilation.namedChunkGroups
			);

			let output = JSON.stringify(manifest);
			compilation.assets['push-manifest.json'] = {
				source() {
					return output;
				},
				size() {
					return output.length;
				},
			};

			callback();
		});
	}
};
