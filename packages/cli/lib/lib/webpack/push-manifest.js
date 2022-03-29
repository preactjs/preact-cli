const webpack = require('webpack');
const createLoadManifest = require('./create-load-manifest');

module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.hooks.emit.tap(
			{
				name: 'PushManifestPlugin',
				stage: webpack.Compiler.PROCESS_ASSETS_STAGE_REPORT,
			},
			compilation => {
				const manifest = createLoadManifest(
					compilation.assets,
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

				return compilation;

				// callback();
			}
		);
	}
};
