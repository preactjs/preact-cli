# preact-cli

> Start building a [Preact] Progressive Web App in seconds 🔥

### Features:

- **100/100 Lighthouse score**, right out of the box ([proof])
- Fully **automatic code splitting** for routes
- Transparently code-split any component with an [`async!`] prefix
- Auto-generated [Service Workers] for offline caching powered by [sw-precache]
- [PRPL](https://developers.google.com/web/fundamentals/performance/prpl-pattern/) pattern support for efficient loading
- Zero-configuration pre-rendering / server-side rendering hydration
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

### CLI Options

```sh
$ preact create

  --name      directory and package name for the new app
  --dest      Directory to create the app within                  [default: <name>]
  --type      A project template to start from
              [Options: "default", "full", "simple", "empty"]     [default: "default"]
  --less      Pre-install LESS support                 [boolean]  [default: false]
  --sass      Pre-install SASS/SCSS support            [boolean]  [default: false]

$ preact build

  --src             Entry file (index.js)                         [default: "src"]
  --dest            Directory root for output                     [default: "build"]
  --production, -p  Create a minified production build.           [default: true]
  --less, -l        Build and compile LESS files                  [default: false]
  --sass, -s        Build and compile SASS files                  [default: false]
  --prerender       Pre-render static app content.                [default: true]
  --clean           Clear output directory before building.       [default: true]
  --json            Generate build statistics for analysis.       [default: false]

$ preact watch

  --src        Entry file (index.js)                              [default: "src"]
  --port, -p   Port to start a server on                          [default: "8080"]
  --host                                              [boolean]   [default: "0.0.0.0"]
  --prerender  Pre-render static app content on initial build     [default: false]

$ preact serve

  --dir       Directory root to serve static files from.          [default: "build"]
  --cwd       The working directory in which to spawn a server.   [default: .]
  --server    Which server to run, or "config" to produce a firebase config.      	
  	      [options: "simplehttp2server", "superstatic", "config"] [default:"simplehttp2server"]
  --dest      Directory or filename where firebase.json should be written
              (used for --server config)                          [default: -]
  --port, -p  Port to start a server on                           [default: "8080"]

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
[Service Workers]: https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
[`async!`]: https://github.com/developit/preact-cli/blob/222e7018dd360e40f7db622191aeca62d6ef0c9a/examples/full/src/components/app.js#L7
