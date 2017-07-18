# preact-cli [![Build Status](https://travis-ci.org/developit/preact-cli.svg?branch=master)](https://travis-ci.org/developit/preact-cli) [![NPM Downloads](https://img.shields.io/npm/dm/preact-cli.svg?style=flat)](https://www.npmjs.com/package/preact-cli) [![NPM Version](https://img.shields.io/npm/v/preact-cli.svg?style=flat)](https://www.npmjs.com/package/preact-cli)

> Start building a [Preact] Progressive Web App in seconds 🔥

### Features:

- **100/100 Lighthouse score**, right out of the box ([proof])
- Fully **automatic code splitting** for routes
- Transparently code-split any component with an [`async!`] prefix
- Auto-generated [Service Workers] for offline caching powered by [sw-precache]
- [PRPL] pattern support for efficient loading
- Zero-configuration pre-rendering / server-side rendering hydration
- Support for CSS Modules, LESS, Sass, Stylus; with Autoprefixer
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

### Using Yarn

```sh
# create a new project:
preact create your-app-name --yarn

# start a live-reload/HMR dev server:
yarn watch

# go to production:
yarn build

# generate configuration in Firebase Hosting format:
yarn serve -- --server config
```

### CLI Options

```sh
$ preact create

  --name        Directory and package name for the new app.
  --dest        Directory to create the app within.                 [default: <name>]
  --type        A project template to start from.
                  [Options: "full", "root", "simple", "empty"]     [default: "full"]
  --less        Pre-install LESS support.                [boolean]  [default: false]
  --sass        Pre-install SASS/SCSS support.           [boolean]  [default: false]
  --stylus      Pre-install STYLUS support.              [boolean]  [default: false]
  --git         Initialize version control using git.    [boolean]  [default: false]
  --no-install  Disables installing of dependencies.     [boolean]  [default: false]

$ preact build

  --src             Entry file (index.js).                        [default: "src"]
  --dest            Directory root for output.                    [default: "build"]
  --production, -p  Create a minified production build.           [default: true]
  --prerender       Pre-render static app content.                [default: true]
  --prerenderUrls   Path to pre-render routes configuration.      [default "prerender-urls.json"]
  --template        Path to template file.
  --clean           Clear output directory before building.       [default: true]
  --json            Generate build statistics for analysis.       [default: false]
  --config, -c      Path to custom CLI config.

$ preact watch

  --src        Entry file (index.js).                             [default: "src"]
  --port, -p   Port to start a server on.                         [default: "8080"]
  --host                                              [boolean]   [default: "0.0.0.0"]
  --prerender  Pre-render static app content on initial build.    [default: false]
  --template   Path to template file.

$ preact serve

  --dir       Directory root to serve static files from.          [default: "build"]
  --cwd       The working directory in which to spawn a server.   [default: .]
  --server    Which server to run, or "config" to produce a firebase config.
          [options: "simplehttp2server", "superstatic", "config"] [default:"simplehttp2server"]
  --dest      Directory or filename where firebase.json should be written.
              (used for --server config)                          [default: -]
  --port, -p  Port to start a server on.                          [default: "8080"]

```

### Deploying

```sh
# create a production build:
npm run build

# generate configuration in Firebase Hosting format:
npm run serve -- --server config

# Copy your static files to a server!
```

### Pre-rendering

Preact CLI in order to follow [PRPL] pattern renders initial route (`/`) into generated static `index.html` - this ensures that users get to see your page before any JavaScript is run, and thus providing users with slow devices or poor connection your website's content much faster.

Preact CLI does this by rendering your app inside node - this means that we don't have access to DOM or other global variables available in browsers, similar how it would be in server-side rendering scenarios. In case you need to rely on browser APIs you could:
- drop out of prerendering by passing `--no-prerender` flag to `preact build`,
- write your code in a way that supports server-side rendering by wrapping code that requires browser's APIs in conditional statements `if (typeof window !== "undefined") { ... }` ensuring that on server those lines of code are never reached. Alternatively you could use a helper library like [window-or-global](https://www.npmjs.com/package/window-or-global).

### Custom Configuration

#### Plugins

To make customizing your configuration easier, preact-cli supports plugins. Visit the [Plugins wiki](https://github.com/developit/preact-cli/wiki/Plugins) for a tutorial on how to use them.

#### Browserslist

You may customize your list of supported browser versions by declaring a [`"browserslist"`](https://github.com/ai/browserslist) key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`](https://github.com/babel/babel-preset-env#targetsbrowsers)) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

By default, `preact-cli` emulates the following config:

```js
// package.json
{
  "browserslist": [
    "> 1%",
    "IE >= 9",
    "last 2 versions"
  ]
}
```

#### Babel

To customize Babel, you have two options:

1. You may create a [`.babelrc`](https://babeljs.io/docs/usage/babelrc/) file in your project's root directory. Any settings you define here will overwrite matching config-keys within [Preact CLI preset]. For example, if you pass a `"plugins"` object, it will replace & reset all Babel plugins that Preact CLI defaults to.

2. If you'd like to modify or add to the existing Babel config, you must use a `preact.config.js` file. Visit the [Webpack](#webpack) section for more info, or check out the [Customize Babel](https://github.com/developit/preact-cli/wiki/Config-Recipes#customising-babel-options-using-loader-helpers) example!

#### Webpack

To customize webpack create ```preact.config.js``` file which exports function that will change webpack's config.

```
/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when working with config.
 **/
export default function (config, env, helpers) {
	/** you can change config here **/
}
```
See [WebpackConfigHelpers] docs for more info on ```helpers``` argument which contains methods to find various parts of configuration. Additionally see our [recipes wiki](https://github.com/developit/preact-cli/wiki/Config-Recipes) containing examples on how to change webpack configuration.

#### Prerender multiple routes

The `--prerender` flag will prerender by default only the root of your application.
If you want to prerender other routes you can create a `prerender-urls.json` file, which contains the set of routes you want to render.
The format required for defining your routes is an array of objects with a `url` key and an optional `title` key.
```js
// prerender-urls.json
[{
  "url": "/",
  "title": "Homepage"
}, {
  "url": "/route/random"
}]
```

You can customise the path of `prerender-urls.json` by using the flag `--prerenderUrls`.
```
preact build --prerenderUrls src/prerender-urls.json
```

#### Template
A template is used to render your page.

The default one is visible [here](src/resources/template.html) and it's going to be enough for the majority of cases.

If you want to customise your template you can pass a custom template with the `--template` flag.

The `--template` flag is available on the `build` and `watch` commands.
```
preact build --template src/template.html
preact watch --template src/template.html
```

[preact]: https://github.com/developit/preact
[preact-router]: https://github.com/developit/preact-router
[sw-precache]: https://github.com/GoogleChrome/sw-precache
[proof]: https://googlechrome.github.io/lighthouse/viewer/?gist=142af6838482417af741d966e7804346
[Service Workers]: https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
[`async!`]: https://github.com/developit/preact-cli/blob/222e7018dd360e40f7db622191aeca62d6ef0c9a/examples/full/src/components/app.js#L7
[```.babelrc```]: https://babeljs.io/docs/usage/babelrc/
[Preact CLI preset]: https://github.com/developit/preact-cli/blob/master/src/lib/babel-config.js
[WebpackConfigHelpers]: docs/webpack-helpers.md
[PRPL]: https://developers.google.com/web/fundamentals/performance/prpl-pattern/
