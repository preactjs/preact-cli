const smallBuildCommons = {
	assets: {
		'favicon.ico': { size: 15086 },
		'icon.png': { size: 51484 }
	},
	'polyfills.js': { size: 4620 },
	'polyfills.js.map': { size: 31760 },
	'favicon.ico': { size: 15086 },
	'sw.js': { size: 3330 },
	'manifest.json': { size: 298 },
	'push-manifest.json': { size: 2 },
};

const fullBuildCommons = {
	assets: {
		'favicon.ico': { size: 15086 },
		icons: {
			'android-chrome-192x192.png': { size: 14058 },
			'android-chrome-512x512.png': { size: 51484 },
			'apple-touch-icon.png': { size: 12746 },
			'favicon-16x16.png': { size: 626 },
			'favicon-32x32.png': { size: 1487 },
			'mstile-150x150.png': { size: 9050 }
		}
	},
	'polyfills.js': { size: 4620 },
	'push-manifest.json': { size: 303 },
	'favicon.ico': { size: 15086 },
	'manifest.json': { size: 426 },
	'sw.js': { size: 3850 }
};

export default {
	empty: {
		...smallBuildCommons,
		'bundle.js': { size: 9810 },
		'bundle.js.map': { size: 44660 },
		'index.html': { size: 630 },
		'style.css': { size: 131 },
		'style.css.map': { size: 359 },
	},
	simple: {
		...smallBuildCommons,
		'bundle.js': { size: 10460 },
		'bundle.js.map': { size: 48670 },
		'index.html': { size: 640 },
		'style.css': { size: 296},
		'style.css.map': { size: 621 },
	},
	root: {
		...fullBuildCommons,
		'bundle.js': { size: 18460 },
		'bundle.js.map': { size: 101500 },
		'route-home.chunk.*.js': { size: 1020 },
		'route-home.chunk.*.js.map': { size: 4980 },
		'route-profile.chunk.*.js': { size: 1660 },
		'route-profile.chunk.*.js.map': { size: 8610 },
		'polyfills.js.map': { size: 31750 },
		'index.html': { size: 870 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2246 },
	},
	'default': {
		...fullBuildCommons,
		'bundle.js': { size: 19300 },
		'bundle.js.map': { size: 105590 },
		'route-home.chunk.*.js': { size: 1000 },
		'route-home.chunk.*.js.map': { size: 4980 },
		'route-profile.chunk.*.js': { size: 1650 },
		'route-profile.chunk.*.js.map': { size: 8610 },
		'polyfills.js.map': { size: 31800 },
		'index.html': { size: 850 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2345 },
	}
};
