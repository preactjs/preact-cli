export const normalize = obj => {
	let keys = Object.keys(obj);

	if (keys.length === 1 && keys[0] === 'size' && typeof obj.size === 'number') {
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
		'bundle.js': { size: 10760 },
		'index.html': { size: 534 },
		'style.css': { size: 130 },
		'style.css.map': { size: 360 },
		'ssr-build': {
			'ssr-bundle.js': { size: 9450 },
			'style.css': { size: 130 },
			'style.css.map': { size: 360 },
		}
	},
	simple: {
		...smallBuildCommons,
		'bundle.js': { size: 11410 },
		'index.html': { size: 548 },
		'style.css': { size: 296},
		'style.css.map': { size: 621 },
		'manifest.json': { size: 290 },
		'ssr-build': {
			'ssr-bundle.js': { size: 10100 },
			'style.css': { size: 296 },
			'style.css.map': { size: 621 },
		}
	},
	root: {
		...fullBuildCommons,
		'bundle.js': { size: 18540 },
		'route-home.chunk.*.js': { size: 970 },
		'route-profile.chunk.*.js': { size: 1600 },
		'index.html': { size: 775 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2246 },
		'ssr-build': {
			'ssr-bundle.js': { size: 18960 },
			'style.css': { size: 1065 },
			'style.css.map': { size: 2250 },
		}
	},
	'default': {
		...fullBuildCommons,
		'bundle.js': { size: 19390 },
		'route-home.chunk.*.js': { size: 970 },
		'route-profile.chunk.*.js': { size: 1610 },
		'index.html': { size: 775 },
		'style.css': { size: 1065 },
		'style.css.map': { size: 2345 },
		'ssr-build': {
			'ssr-bundle.js': { size: 19820 },
			'style.css': { size: 1065 },
			'style.css.map': { size: 2345 },
		}
	}
});

export const sassPrerendered = `
<body>
	<div class="background__21gOq">
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
	<script src="/bundle.js" async=""></script>
</body>
`;
