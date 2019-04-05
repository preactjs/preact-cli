self.__precacheManifest = [].concat(self.__precacheManifest || []);

/* global workbox */
/** We are sure brotli is enabled for browsers supporting script type=module
 * so we do brotli support only for them.
 * We can do brolti support for other browsers but there is no good way of
 * feature detect the same at the time of pre-caching.
 */
if (process.env.ENABLE_BROTLI && process.env.ES_BUILD) {
	// Alter the precache manifest to precache brotli files instead of gzip files.
	self.__precacheManifest = self.__precacheManifest.map(asset => {
		if (/.*.js$/.test(asset.url)) {
			asset.url = asset.url.replace(/.esm.js$/, '.esm.js.br');
		}
		return asset;
	});

	class BrotliRedirectPlugin {
		// Before saving the response in cache, we need to treat the headers.
		async cacheWillUpdate({ response }) {
			const clonedResponse = response.clone();
			if (/.js.br(\?.*)?$/.test(clonedResponse.url)) {
				const headers = new Headers(clonedResponse.headers);
				headers.set('content-type', 'application/javascript');
				return new Response(await clonedResponse.text(), { headers });
			}
			return response;
		}
	}
	workbox.precaching.addPlugins([new BrotliRedirectPlugin()]);
}

const precacheOptions = {};
if (process.env.ENABLE_BROTLI) {
	precacheOptions['urlManipulation'] = ({ url }) => {
		if (/.esm.js$/.test(url.href)) {
			url.href = url.href + '.br';
		}
		return [url];
	};
}

workbox.precaching.precacheAndRoute(self.__precacheManifest, precacheOptions);
workbox.routing.registerNavigationRoute(
	workbox.precaching.getCacheKeyForURL('/index.html')
);
