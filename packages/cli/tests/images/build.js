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

	'ssr-build/ssr-bundle.css': 2352,
	'ssr-build/ssr-bundle.css.map': 3609,
	'ssr-build/ssr-bundle.js': 27197,
	'ssr-build/ssr-bundle.js.map': 61808,
	'ssr-build/asset-manifest.json': 82,

	'bundle.8b29d.js': 21563,
	'bundle.8b29d.js.map': 86009,
	'bundle.8b29d.legacy.js': 22586,
	'bundle.8b29d.legacy.js.map': 107151,
	'bundle.cf9c9.css': 1173,
	'bundle.cf9c9.css.map': 2165,

	'dom-polyfills.9b9a8.js': 5221,
	'dom-polyfills.9b9a8.js.map': 18676,
	'es-polyfills.js': 42690,

	'favicon.ico': 15086,
	'index.html': 3998,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,
	'push-manifest.json': 388,
	'asset-manifest.json': 1004,

	'route-home.chunk.70493.js': 1082,
	'route-home.chunk.70493.js.map': 3359,
	'route-home.chunk.70493.legacy.js': 1159,
	'route-home.chunk.70493.legacy.js.map': 4022,
	'route-home.chunk.b55f8.css': 838,
	'route-home.chunk.b55f8.css.map': 1406,

	'route-profile.chunk.5e2be.js': 3097,
	'route-profile.chunk.5e2be.js.map': 12031,
	'route-profile.chunk.5e2be.legacy.js': 3240,
	'route-profile.chunk.5e2be.legacy.js.map': 15421,
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

exports.preload = {};

exports.preload.true = `
<head>
	<meta charset=\\"utf-8\\">
	<title>preact-preload-chunks<\\/title>
	<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1\\">
	<meta name=\\"mobile-web-app-capable\\" content=\\"yes\\">
	<meta name=\\"apple-mobile-web-app-capable\\" content=\\"yes\\">
	<link rel=\\"apple-touch-icon\\" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel=\\"manifest\\" href=\\"\\/manifest\\.json\\">
	<link rel=\\"preload\\" href=\\"\\/bundle\\.\\w{5}\\.js\\" as=\\"script\\">
	<link rel=\\"preload\\" href=\\"\\/route-home\\.chunk\\.\\w{5}\\.js\\" as=\\"script\\">
	<link rel=\\"preload\\" href=\\"\\/route-home\\.chunk\\.\\w{5}\\.css\\" as=\\"style\\">
	<style>html{padding:0}<\\/style>
	<link href=\\"\\/bundle\\.\\w{5}\\.css\\" rel=\\"stylesheet\\" media=\\"print\\" onload=\\"this.media='all'\\">
	<noscript>
		<link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
	</noscript>
</head>
`;

exports.preload.false = `
<head>
	<meta charset=\\"utf-8\\">
	<title>preact-preload-chunks<\\/title>
	<meta name=\\"viewport\\" content=\\"width=device-width,initial-scale=1\\">
	<meta name=\\"mobile-web-app-capable\\" content=\\"yes\\">
	<meta name=\\"apple-mobile-web-app-capable\\" content=\\"yes\\">
	<link rel=\\"apple-touch-icon\\" href=\\"\\/assets\\/icons\\/apple-touch-icon\\.png\\">
	<link rel=\\"manifest\\" href=\\"\\/manifest\\.json\\">
	<style>html{padding:0}<\\/style>
	<link href=\\"\\/bundle\\.\\w{5}\\.css\\" rel=\\"stylesheet\\" media=\\"print\\" onload=\\"this.media='all'\\">
	<noscript>
		<link rel=\\"stylesheet\\" href=\\"\\/bundle.\\w{5}.css\\">
	</noscript>
</head>
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

exports.pushManifest = `
{
	"/":{
		"bundle.\\w{5}.css":{
			"type":"style",
			"weight":1
		},
		"bundle.\\w{5}.js":{
			"type":"script",
			"weight":1
		},
		"route-home.chunk.\\w{5}.js":{
			"type":"script",
			"weight":0.9
		},
		"route-home.chunk.\\w{5}.css":{
			"type":"style",
			"weight":0.9
		}
	},
	"/profile":{
		"bundle.\\w{5}.css":{
			"type":"style",
			"weight":1
		},
		"bundle.\\w{5}.js":{
			"type":"script",
			"weight":1
		},
		"route-profile.chunk.\\w{5}.js":{
			"type":"script",
			"weight":0.9
		}
	}
}
`;

exports.pushManifestAlteredFilenames = `
{
	"/":{
		"scripts/bundle.js":{
			"type":"script",
			"weight":1
		}
	}
}
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
