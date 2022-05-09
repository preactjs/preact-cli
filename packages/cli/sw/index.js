import { registerRoute, setCatchHandler } from 'workbox-routing';
import { precacheAndRoute, getCacheKeyForURL } from 'workbox-precaching';
import { isNav } from './utils';
import { NETWORK_HANDLER, PRECACHING_OPTIONS } from './constants';

export function getFiles() {
	return self.__WB_MANIFEST;
}

export function setupPrecaching(precacheFiles, precachingOptions) {
	precacheAndRoute(precacheFiles, precachingOptions || PRECACHING_OPTIONS);
}

export function setupRouting() {
	/**
	 * Adding this before `precacheAndRoute` lets us handle all
	 * the navigation requests even if they are in precache.
	 */
	registerRoute(({ event }) => isNav(event), NETWORK_HANDLER);

	setCatchHandler(({ event }) => {
		if (isNav(event)) {
			return caches.match(
				getCacheKeyForURL('/200.html') || getCacheKeyForURL('/index.html')
			);
		}
		return Response.error();
	});
}

export { PRECACHING_OPTIONS };
