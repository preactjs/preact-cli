const createLoadManifest = require('./create-load-manifest');

module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.plugin('emit', function(compilation, callback) {
      const manifest = createLoadManifest(compilation.assets);

			let output = JSON.stringify(manifest);
			compilation.assets['push-manifest.json'] = {
				source() {
					return output;
				},
				size() {
					return output.length;
				}
			};

			callback();
		});
	}
};
