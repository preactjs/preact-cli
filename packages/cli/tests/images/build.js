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
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
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
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
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
	<link href=\\"/bundle.\\w{5}.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
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
	<link href=\\"\\/bundle\\.\\w{5}\\.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
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
	<link href=\\"\\/bundle\\.\\w{5}\\.css\\" rel=\\"stylesheet\\" media=\\"only x\\" onload=\\"this.media='all'\\">
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
		<script defer="defer" src="/bundle.\\w{5}.js"></script>
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
		<style></style>
	</head>
	<body>
		<h1>Public path test</h1>
		<script type="__PREACT_CLI_DATA__">%7B%22preRenderData%22:%7B%22url%22:%22/%22%7D%7D</script>
		<script defer="defer" src="/example-path/bundle.\\w{5}.js"></script>
		<script nomodule="" src="/example-path/polyfills.\\w{5}.js"></script>
	</body>
</html>
`;
