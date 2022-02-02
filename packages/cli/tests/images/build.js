const common = {
	'polyfills.1ea90.js': 6426,
	'polyfills.1ea90.js.map': 21668,
};

exports.default = Object.assign({}, common, {
	'assets/icons/android-chrome-192x192.png': 14058,
	'assets/icons/android-chrome-512x512.png': 51484,
	'assets/icons/apple-touch-icon.png': 12746,
	'assets/icons/favicon-16x16.png': 626,
	'assets/icons/favicon-32x32.png': 1487,
	'assets/icons/mstile-150x150.png': 9050,
	'assets/preact-logo.svg': 645,
	'assets/preact-logo-inverse.svg': 649,
	'assets/favicon.ico': 15086,
	'ssr-build/ssr-bundle.82489.css': 2601,
	'ssr-build/ssr-bundle.82489.css.map': 3708,
	'ssr-build/ssr-bundle.js': 28830,
	'ssr-build/ssr-bundle.js.map': 52686,
	'ssr-build/asset-manifest.json': 178,
	'bundle.4c6ac.css': 1276,
	'bundle.9131e.js': 22529,
	'bundle.9131e.js.map': 111801,
	'favicon.ico': 15086,
	'index.html': 4127,
	'manifest.json': 455,
	'preact_prerender_data.json': 11,
	'push-manifest.json': 388,
	'asset-manifest.json': 1142,
	'route-home.chunk.9bcab.css': 834,
	'route-home.chunk.5d28d.js': 1149,
	'route-home.chunk.5d28d.js.map': 1961,
	'route-profile.chunk.4c330.js': 3490,
	'route-profile.chunk.4c330.js.map': 15002,
});
exports['default-esm'] = Object.assign({}, exports.default, {
	'bundle.*.esm.js': 22249,
	'bundle.*.esm.js.map': 113538,
	'polyfills.*.esm.js': 5721,
	'polyfills.*.esm.js.map': 21633,
	'route-home.chunk.*.esm.js': 1127,
	'route-home.chunk.*.esm.js.map': 1957,
	'route-profile.chunk.*.esm.js': 2424,
	'route-profile.chunk.*.esm.js.map': 14942,
	'index.html': 4221,
	'push-manifest.json': 404,
	'asset-manifest.json': 1174,
});

exports.sass = `
<body>
	<div class="background__2mKGE">
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
		<script type="__PREACT_CLI_DATA__">%7B%22prerenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script blocking="" src="/bundle.\\w{5}.js"></script>
		<script nomodule="" src="/polyfills.\\w{5}.js"></script>
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

exports.pushManifestEsm = `
{
	"/":{
		"bundle.\\w{5}.css":{
			"type":"style",
			"weight":1
		},
		"bundle.\\w{5}.esm.js":{
			"type":"script",
			"weight":1
		},
		"route-home.chunk.\\w{5}.esm.js":{
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
		"bundle.\\w{5}.esm.js":{
			"type":"script",
			"weight":1
		},
		"route-profile.chunk.\\w{5}.esm.js":{
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
		<script type="__PREACT_CLI_DATA__">%7B%22prerenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script blocking="" src="/example-path/bundle.\\w{5}.js"></script>
		<script nomodule="" src="/example-path/polyfills.\\w{5}.js"></script>
	</body>
</html>
`;
