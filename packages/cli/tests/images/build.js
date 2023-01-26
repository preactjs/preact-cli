exports.default = {
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'assets/preact-logo.svg': 645,
	'assets/preact-logo-inverse.svg': 649,
	'assets/favicon.ico': 15086,

	'ssr-build/ssr-bundle.js': 27642,
	'ssr-build/ssr-bundle.js.map': 65008,
	'ssr-build/ssr-bundle.css': 2346,
	'ssr-build/ssr-bundle.css.map': 3603,

	'bundle.c74f5.js': 23145,
	'bundle.c74f5.js.map': 92586,
	'bundle.c74f5.legacy.js': 24195,
	'bundle.c74f5.legacy.js.map': 107151,
	'bundle.6329a.css': 1173,
	'bundle.6329a.css.map': 2165,

	'dom-polyfills.aeb97.js': 5221,
	'dom-polyfills.aeb97.js.map': 18676,
	'es-polyfills.js': 46419,

	'favicon.ico': 15086,
	'index.html': 1972,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,

	'route-home.chunk.6c974.js': 1179,
	'route-home.chunk.6c974.js.map': 3814,
	'route-home.chunk.6c974.legacy.js': 1222,
	'route-home.chunk.6c974.legacy.js.map': 4452,
	'route-home.chunk.d116e.css': 838,
	'route-home.chunk.d116e.css.map': 1406,

	'route-profile.chunk.0401b.js': 3165,
	'route-profile.chunk.0401b.js.map': 13170,
	'route-profile.chunk.0401b.legacy.js': 3302,
	'route-profile.chunk.0401b.legacy.js.map': 15845,
};

exports.prerender = {};

exports.prerender.heads = {};
exports.prerender.heads.home = `
<head>
	<meta charset="utf-8">
	<title>Home<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\">
<\\/head>
`;

exports.prerender.heads.route66 = `
<head>
	<meta charset="utf-8">
	<title>Route66<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\">
<\\/head>
`;

exports.prerender.heads.custom = `
<head>
	<meta charset="utf-8">
	<title>Custom<\\/title>
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<meta name="mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<link rel="apple-touch-icon" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel="manifest" href="\\/manifest\\.json">
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\">
<\\/head>
`;

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

exports.prerender.custom = `
<body>
	<div id="app">
		<div>It worked!</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.customhook = `
<body>
	<div id="app">
		<div>It worked with hook!</div>
	</div>
	{{ ... }}
</body>
`;

exports.prerender.htmlSafe = `
<body>
	<div id="app">
		<div>&lt;script&gt;It is HTML safe&lt;/script&gt;</div>
	</div>
	{{ ... }}
</body>
`;

exports.template = `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-custom-template</title>
		<meta name="example-meta" content="Hello Prod">
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		<script defer="defer" src="/bundle.\\w{5}.js"></script>
	</body>
</html>
`;

exports.publicPath = `
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-public-path</title>
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<meta name="mobile-web-app-capable" content="yes">
		<meta name="apple-mobile-web-app-capable" content="yes">
		<link rel="apple-touch-icon" href="/example-path/assets/icons/apple-touch-icon.png">
		<link rel="manifest" href="/example-path/manifest.json">
		<link href="/example-path/bundle.\\w{5}.css" rel="stylesheet">
	</head>
	<body>
		<h1>Public path test</h1>
		<script type="__PREACT_CLI_DATA__">%7B%22prerenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script type="module" src="/example-path/bundle.\\w{5}.js"></script>
		<script nomodule src="/example-path/dom-polyfills.\\w{5}.js"></script>
		<script nomodule src="/example-path/es-polyfills.js"></script>
		<script nomodule defer="defer" src="/example-path/bundle.\\w{5}.legacy.js"></script>
	</body>
</html>
`;
