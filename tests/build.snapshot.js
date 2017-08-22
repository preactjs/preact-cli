
const commons = {
	'polyfills.*.js': { size: 4620 },
	'polyfills.*.js.map': { size: 31760 },
	'favicon.ico': { size: 15086 },
};

const smallBuildCommons = {
	...commons,
	assets: {
		'favicon.ico': { size: 15086 },
		'icon.png': { size: 51484 }
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
			'mstile-150x150.png': { size: 9050 }
		}
	},
	'push-manifest.json': { size: 327 },
	'manifest.json': { size: 426 },
	'sw.js': { size: 3850 }
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
		}
	},
	simple: {
		...smallBuildCommons,
		'bundle.*.js': { size: 10460 },
		'bundle.*.js.map': { size: 48670 },
		'index.html': { size: 640 },
		'style.*.css': { size: 346},
		'style.*.css.map': { size: 673 },
		'manifest.json': { size: 290 },
		'ssr-build': {
			'ssr-bundle.js': { size: 17200 },
			'ssr-bundle.js.map': { size: 33478 },
			'style.*.css': { size: 346 },
			'style.*.css.map': { size: 673 },
		}
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
		'style.*.css': { size: 1135 },
		'style.*.css.map': { size: 2246 },
		'ssr-build': {
			'ssr-bundle.js': { size: 36400 },
			'ssr-bundle.js.map': { size: 65629 },
			'style.*.css': { size: 1135 },
			'style.*.css.map': { size: 2250 },
		}
	},
	'full': {
		...fullBuildCommons,
		'bundle.*.js': { size: 19300 },
		'bundle.*.js.map': { size: 105590 },
		'route-home.chunk.*.js': { size: 1000 },
		'route-home.chunk.*.js.map': { size: 4981 },
		'route-profile.chunk.*.js': { size: 1650 },
		'route-profile.chunk.*.js.map': { size: 8609 },
		'index.html': { size: 850 },
		'style.*.css': { size: 1135 },
		'style.*.css.map': { size: 2345 },
		'ssr-build': {
			'ssr-bundle.js': { size: 38310 },
			'ssr-bundle.js.map': { size: 66661 },
			'style.*.css': { size: 1135 },
			'style.*.css.map': { size: 2345 },
		}
	}
};

export const sassPrerendered = `
<body>
	<div class="background__21gOq">
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
	{{ ... }}
</body>
`;

export const withCustomTemplate = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-app</title>
		<link rel="shortcut icon" href="/favicon.ico"></link>
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		{{ ... }}
	</body>
</html>
`;

export const multiplePrerenderingHome = `
<body>
	<div id="app">
		<div>Home</div>
	</div>
	{{ ... }}
</body>
`;

export const multiplePrerenderingRoute = `
<body>
	<div id="app">
		<div>Route66</div>
	</div>
	{{ ... }}
</body>
`;
