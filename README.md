# preact-cli

> Start building a [Preact] Progressive Web App in seconds 🔥

### Features:

- **100/100 Lighthouse score**, right out of the box ([proof])
- Fully **automatic code splitting** for routes
- Transparently code-split any component with an `async!` prefix
- Auto-generated ServiceWorker for offline caching powered by [sw-precache]
- [PRPL](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) pattern support for efficient loading. 
- Zero-configuration pre-rendering / SSR hydration
- Support for CSS Modules, LESS & autoprefixer
- Monitor your bundle/chunk sizes with built-in tracking
- Automatic app mounting, debug helpers & Hot Module Replacement
- In just **4.5kb** you get a productive environment:
	- [preact]
	- [preact-router]
	- 1.5kb of conditionally-loaded polyfills for [fetch](https://github.com/developit/unfetch) & [Promise](https://npm.im/promise-polyfill)


### Commands

`preact create your-app-name`: create a new app

`preact build`: build an app

`preact watch`: start a dev server


### Quickstart

```sh
# once and you're good:
npm i -g preact-cli

# create a new project:
preact create my-great-app
cd my-great-app

# start a live-reload/HMR dev server:
npm start

# go to production:
npm run build
```


### Deploying

```sh
# create a production build:
npm run build

# generate configuration in Firebase Hosting format:
npm run serve -- --server config

# Copy your static files to a server!
```


[preact]: https://github.com/developit/preact
[preact-router]: https://github.com/developit/preact-router
[sw-precache]: https://github.com/GoogleChrome/sw-precache
[proof]: https://googlechrome.github.io/lighthouse/viewer/?gist=142af6838482417af741d966e7804346
