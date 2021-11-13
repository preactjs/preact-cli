const path = require('path');

exports.default = [
	'.gitignore',
	'package.json',
	'README.md',
	'src/assets/favicon.ico',
	'src/assets/icons/android-chrome-192x192.png',
	'src/assets/icons/android-chrome-512x512.png',
	'src/assets/icons/apple-touch-icon.png',
	'src/assets/icons/favicon-16x16.png',
	'src/assets/icons/favicon-32x32.png',
	'src/assets/icons/mstile-150x150.png',
	'src/components/app.js',
	'src/components/header/index.js',
	'src/components/header/style.css',
	'src/index.js',
	'src/manifest.json',
	'src/routes/home/index.js',
	'src/routes/home/style.css',
	'src/routes/profile/index.js',
	'src/routes/profile/style.css',
	'src/style/index.css',
	'src/sw.js',
	'src/template.html',
	'tests/__mocks__/browserMocks.js',
	'tests/__mocks__/fileMocks.js',
	'tests/__mocks__/setupTests.js',
	'tests/header.test.js',
]
	.map(s => s.replace(/\//g, path.sep))
	.sort();
