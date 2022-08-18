exports.default = {
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'assets/favicon.ico': 15086,

	'ssr-build/ssr-bundle.css': 1281,
	'ssr-build/ssr-bundle.css.map': 2069,
	'ssr-build/ssr-bundle.js': 26049,
	'ssr-build/ssr-bundle.js.map': 63276,
	'ssr-build/asset-manifest.json': 166,

	'bundle.6e8b3.js': 21560,
	'bundle.6e8b3.js.map': 85822,
	'bundle.6e8b3.legacy.js': 22549,
	'bundle.6e8b3.legacy.js.map': 106841,
	'bundle.354c3.css': 945,
	'bundle.354c3.css.map': 1758,

	'dom-polyfills.9b9a8.js': 5221,
	'dom-polyfills.9b9a8.js.map': 18676,
	'es-polyfills.js': 42690,

	'favicon.ico': 15086,
	'index.html': 2264,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,
	'asset-manifest.json': 1729,

	'route-home.chunk.c9a13.js': 347,
	'route-home.chunk.c9a13.js.map': 1848,
	'route-home.chunk.c9a13.legacy.js': 388,
	'route-home.chunk.c9a13.legacy.js.map': 2136,
	'route-home.chunk.6eaee.css': 112,
	'route-home.chunk.6eaee.css.map': 224,

	'route-profile.chunk.e4b0a.js': 3198,
	'route-profile.chunk.e4b0a.js.map': 12743,
	'route-profile.chunk.e4b0a.legacy.js': 3335,
	'route-profile.chunk.e4b0a.legacy.js.map': 16137,
	'route-profile.chunk.0af3e.css': 118,
	'route-profile.chunk.0af3e.css.map': 231,
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
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"print\\" onload=\\"this.media='all'\\">
	<noscript>
		<link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
	</noscript>
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
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"print\\" onload=\\"this.media='all'\\">
	<noscript>
		<link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
	</noscript>
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
	<style>html{padding:0}<\\/style>
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"print\\" onload=\\"this.media='all'\\">
	<noscript>
		<link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
	</noscript>
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
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<title>preact-custom-template</title>
		<meta name="example-meta" content="Hello Prod">
		<link rel="manifest" href="/manifest.json">
	</head>
	<body>
		<h1>Guess what</h1>
		<h2>This is an app with custom template</h2>
		<script defer="defer" src="/bundle.\\w{5}.js"></script>
		<h2>This is an app with custom template</h2>
		<script type="__PREACT_CLI_DATA__">%7B%22preRenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script crossorigin="anonymous" src="/bundle.\\w{5}.js" type="module"></script>
		<script nomodule="" src="/dom-polyfills.\\w{5}.js"></script>
		<script nomodule="" src="/es-polyfills.js"></script>
		<script nomodule="" defer="defer" src="/bundle.\\w{5}.legacy.js"></script>
	</body>
</html>
`;

exports.publicPath = `
<!DOCTYPE html>
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
		<script type="__PREACT_CLI_DATA__">%7B%22preRenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script crossorigin="anonymous" src="/example-path/bundle.\\w{5}.js" type="module"></script>
		<script nomodule="" src="/example-path/dom-polyfills.\\w{5}.js"></script>
		<script nomodule="" src="/example-path/es-polyfills.js"></script>
		<script nomodule="" defer="defer" src="/example-path/bundle.\\w{5}.legacy.js"></script>
	</body>
</html>
`;
