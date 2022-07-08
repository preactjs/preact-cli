exports.default = {
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'assets/favicon.ico': 15086,

	'ssr-build/ssr-bundle.77c49.css': 1281,
	'ssr-build/ssr-bundle.77c49.css.map': 2081,
	'ssr-build/ssr-bundle.js': 26049,
	'ssr-build/ssr-bundle.js.map': 59971,
	'ssr-build/asset-manifest.json': 82,

	'bundle.7a791.js': 21563,
	'bundle.7a791.js.map': 86009,
	'bundle.7a791.legacy.js': 22586,
	'bundle.7a791.legacy.js.map': 107151,
	'bundle.9bde9.css': 945,
	'bundle.9bde9.css.map': 1758,

	'dom-polyfills.8a933.legacy.js': 5221,
	'dom-polyfills.8a933.legacy.js.map': 18676,
	'es-polyfills.legacy.js': 42690,

	'favicon.ico': 15086,
	'index.html': 2264,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,
	'push-manifest.json': 450,
	'asset-manifest.json': 943,

	'route-home.chunk.040d2.js': 307,
	'route-home.chunk.040d2.js.map': 1684,
	'route-home.chunk.040d2.legacy.js': 364,
	'route-home.chunk.040d2.legacy.js.map': 1982,
	'route-home.chunk.f1c94.css': 112,
	'route-home.chunk.f1c94.css.map': 224,

	'route-profile.chunk.8c3bd.js': 3121,
	'route-profile.chunk.8c3bd.js.map': 12280,
	'route-profile.chunk.8c3bd.legacy.js': 3266,
	'route-profile.chunk.8c3bd.legacy.js.map': 15684,
	'route-profile.chunk.e0d39.css': 118,
	'route-profile.chunk.e0d39.css.map': 231,
};

exports.sass = `
<body>
	<div class="background__sL1ip">
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
	{{ ... }}
</body>
`;

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
		<script nomodule="" src="/dom-polyfills.\\w{5}.legacy.js"></script>
		<script nomodule="" src="/es-polyfills.legacy.js"></script>
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
		},
		"route-profile.chunk.\\w{5}.css":{
			"type":"style",
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
		<script nomodule="" src="/example-path/dom-polyfills.\\w{5}.legacy.js"></script>
		<script nomodule="" src="/example-path/es-polyfills.legacy.js"></script>
		<script nomodule="" defer="defer" src="/example-path/bundle.\\w{5}.legacy.js"></script>
	</body>
</html>
`;
