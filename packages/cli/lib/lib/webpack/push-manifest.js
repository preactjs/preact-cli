const { Compilation, sources } = require('webpack');
const createLoadManifest = require('./create-load-manifest');

module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.hooks.thisCompilation.tap('PushManifestPlugin', compilation => {
			compilation.hooks.processAssets.tap(
				{
					name: 'PushManifestPlugin',
					stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
				},
				() => {
					const manifest = JSON.stringify(
						createLoadManifest(compilation.assets, compilation.namedChunkGroups)
					);

					compilation.emitAsset(
						'push-manifest.json',
						new sources.RawSource(manifest)
					);
				}
			);
		});
	}
};
