const { Compilation, sources } = require('webpack');
const createLoadManifest = require('./create-load-manifest');

module.exports = class PushManifestPlugin {
	constructor(isProd) {
		this.isProd = isProd;
	}
	apply(compiler) {
		compiler.hooks.thisCompilation.tap('PushManifestPlugin', compilation => {
			compilation.hooks.processAssets.tap(
				{
					name: 'PushManifestPlugin',
					stage: Compilation.PROCESS_ASSETS_STAGE_ANALYSE,
				},
				() => {
					const manifest = JSON.stringify(
						createLoadManifest(
							compilation.assets,
							compilation.namedChunkGroups,
							this.isProd
						)
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
