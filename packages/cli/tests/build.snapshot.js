/**
 * Unused
 * @date 08/22/2017
 * --> keep stats for other templates
 */

const commons = {
	'polyfills.*.js': { size: 4620 },
	'polyfills.*.js.map': { size: 31760 },
	'favicon.ico': { size: 15086 },
};

const smallBuildCommons = {
	...commons,
	assets: {
		'favicon.ico': { size: 15086 },
		'icon.png': { size: 51484 },
	},
	'sw.js': { size: 3330 },
	'manifest.json': { size: 298 },
	'push-manifest.json': { size: 100 },
};

const fullBuildCommons = {
	...commons,
	assets: {
		'favicon.ico': { size: 15086 },
		icons: {
			'android-chrome-192x192.png': { size: 14058 },
			'android-chrome-512x512.png': { size: 51484 },
			'apple-touch-icon.png': { size: 12746 },
			'favicon-16x16.png': { size: 626 },
			'favicon-32x32.png': { size: 1487 },
			'mstile-150x150.png': { size: 9050 },
		},
	},
	'push-manifest.json': { size: 327 },
	'manifest.json': { size: 426 },
	'sw.js': { size: 3850 },
};

export default {
	empty: {
		...smallBuildCommons,
		'bundle.*.js': { size: 9810 },
		'bundle.*.js.map': { size: 44660 },
		'index.html': { size: 630 },
		'style.*.css': { size: 131 },
		'style.*.css.map': { size: 359 },
		'ssr-build': {
			'ssr-bundle.js': { size: 16245 },
			'ssr-bundle.js.map': { size: 31821 },
			'style.*.css': { size: 130 },
			'style.*.css.map': { size: 360 },
		},
	},
	simple: {
		...smallBuildCommons,
		'bundle.*.js': { size: 10460 },
		'bundle.*.js.map': { size: 48670 },
		'index.html': { size: 640 },
		'style.*.css': { size: 296 },
		'style.*.css.map': { size: 621 },
		'manifest.json': { size: 290 },
		'ssr-build': {
			'ssr-bundle.js': { size: 18205 },
			'ssr-bundle.js.map': { size: 33478 },
			'style.*.css': { size: 296 },
			'style.*.css.map': { size: 621 },
		},
	},
	root: {
		...fullBuildCommons,
		'bundle.*.js': { size: 18460 },
		'bundle.*.js.map': { size: 101500 },
		'route-home.chunk.*.js': { size: 1020 },
		'route-home.chunk.*.js.map': { size: 4977 },
		'route-profile.chunk.*.js': { size: 1660 },
		'route-profile.chunk.*.js.map': { size: 8607 },
		'index.html': { size: 870 },
		'style.*.css': { size: 1065 },
		'style.*.css.map': { size: 2246 },
		'ssr-build': {
			'ssr-bundle.js': { size: 39459 },
			'ssr-bundle.js.map': { size: 65629 },
			'style.*.css': { size: 1065 },
			'style.*.css.map': { size: 2250 },
		},
	},
};
