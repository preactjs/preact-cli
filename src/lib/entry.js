import { h, render } from 'preact';
const path = require('path');

if (process.env.NODE_ENV==='development') {
	// enable preact devtools
	require('preact/devtools');
}
else if ('serviceWorker' in navigator && location.protocol === 'https:') {
  const homepageFullUrl = new URL(process.env.HOMEPAGE, window.location);
  if (homepageFullUrl.origin === window.location.origin) {
    //This path should be well-formed, since we know HOMEPAGE
    //has a trailing slash already.
    const swLocation = process.env.HOMEPAGE + 'sw.js';
    navigator.serviceWorker.register(swLocation);
  }
}


const interopDefault = m => m && m.default || m;

let app = interopDefault(require('preact-cli-entrypoint'));

if (typeof app==='function') {
	let root = document.body.firstElementChild;

	let init = () => {
		let app = interopDefault(require('preact-cli-entrypoint'));
		root = render(h(app), document.body, root);
	};

	if (module.hot) module.hot.accept('preact-cli-entrypoint', init);

	init();
}
