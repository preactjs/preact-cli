export const normalize = obj => {
	let keys = Object.keys(obj);

	if (keys.length === 1 && keys[0] === 'size' && typeof keys[0] === 'number') {
		return { size: Math.round(obj.size / 10) * 10 };
	}

	return keys.reduce((agg, key) => {
		let newKey = key.replace(/\.chunk\.\w+\./, '.chunk.*.');
		agg[newKey] = normalize(obj[key]);
		return agg;
	}, {});
};

const smallBuildCommons = {
	assets: {
		'favicon.ico': { size: 15086 },
		'icon.png': { size: 51484 }
	},
	'polyfills.chunk.*.js': { size: 4068 },
	'favicon.ico': { size: 15086 },
	'sw.js': { size: 3378 },
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
	'polyfills.chunk.*.js': { size: 4066 },
	'push-manifest.json': { size: 303 },
	'favicon.ico': { size: 15086 },
	'manifest.json': { size: 426 },
	'sw.js': { size: 3905 }
};

export const expectedOutputs = normalize({
	empty: {
		...smallBuildCommons,
		'bundle.js': { size: 10694 },
		'index.html': { size: 534 },
		'style.css': { size: 131 },
		'style.css.map': { size: 359 },
	},
	simple: {
		...smallBuildCommons,
		'bundle.js': { size: 11336 },
		'index.html': { size: 548 },
		'style.css': { size: 296},
		'style.css.map': { size: 621 },
	},
	root: {
		...fullBuildCommons,
		'bundle.js': { size: 18739 },
		'route-home.chunk.*.js': { size: 959 },
		'route-profile.chunk.*.js': { size: 1595 },
		'index.html': { size: 775 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2246 },
	},
	'default': {
		...fullBuildCommons,
		'bundle.js': { size: 19661 },
		'route-home.chunk.*.js': { size: 961 },
		'route-profile.chunk.*.js': { size: 1597 },
		'index.html': { size: 775 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2345 },
	}
});
