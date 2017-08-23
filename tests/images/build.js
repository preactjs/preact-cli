const common = {
	'polyfills.*.js': 4620,
	'polyfills.*.js.map': 31760,
	'favicon.ico': 15086
};

exports.default = exports.full = {
	...common,
	'assets/favicon.ico': 15086,
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'push-manifest.json': 327,
	'manifest.json': 426,
	'sw.js': 3850,
	'bundle.*.js': 19300,
	'bundle.*.js.map': 105590,
	'route-home.chunk.*.js': 1000,
	'route-home.chunk.*.js.map': 4981,
	'route-profile.chunk.*.js': 1650,
	'route-profile.chunk.*.js.map': 8609,
	'index.html': 850,
	'style.*.css': 1065,
	'style.*.css.map': 2345,
	'ssr-build/ssr-bundle.js': 41715,
	'ssr-build/ssr-bundle.js.map': 66661,
	'ssr-build/style.*.css': 1065,
	'ssr-build/style.*.css.map': 2345
};

exports.sass = `
<body>
	<div class="background__21gOq">
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
	{{ ... }}
</body>
`;

exports.prerender = {};

exports.prerender.home = `
<body>
	<div id="app">
		<div>Home</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.route = `
<body>
	<div id="app">
		<div>Route66</div>
	</div>
	{{ ... }}
</body>
`;

exports.webpack = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-webpack</title>
		<link rel="shortcut icon" href="/favicon.ico"></link>
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		{{ ... }}
	</body>
</html>
`;

