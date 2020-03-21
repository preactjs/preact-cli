import { NetworkFirst } from 'workbox-strategies';
import { cacheNames } from 'workbox-core';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

export const PRECACHING_OPTIONS = {};

export const NETWORK_HANDLER = new NetworkFirst({
	// this cache is plunged with every new service worker deploy so we dont need to care about purging the cache.
	cacheName: cacheNames.precache,
	networkTimeoutSeconds: 5, // if u dont start getting headers within 5 sec fallback to cache.
	plugins: [
		new CacheableResponsePlugin({
			statuses: [200], // only cache valid responses, not opaque responses e.g. wifi portal.
		}),
	],
});
