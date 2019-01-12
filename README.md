# preact-cli [![Build Status](https://travis-ci.org/developit/preact-cli.svg?branch=master)](https://travis-ci.org/developit/preact-cli) [![NPM Downloads](https://img.shields.io/npm/dm/preact-cli.svg?style=flat)](https://www.npmjs.com/package/preact-cli) [![NPM Version](https://img.shields.io/npm/v/preact-cli.svg?style=flat)](https://www.npmjs.com/package/preact-cli)

> Start building a [Preact] Progressive Web App in seconds 🔥

### Features

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
  - 1.5kb of conditionally-loaded polyfills for [fetch] & [Promise]

### Installation

> **Important**: [Node.js](https://nodejs.org/en/) > V6.x is a minimum requirement.

```sh
$ npm install -g preact-cli
```

### Usage

```sh
$ preact create <template-name> <project-name>
```

Example:

```sh
$ preact create default my-project
```

The above command pulls the template from [preactjs-templates/default], prompts for some information, and generates the project at `./my-project/`.

### Official Templates

The purpose of official preact project templates are to provide opinionated development tooling setups so that users can get started with actual app code as fast as possible. However, these templates are un-opinionated in terms of how you structure your app code and what libraries you use in addition to preact.js.

All official project templates are repos in the [preactjs-templates organization]. When a new template is added to the organization, you will be able to run `preact create <template-name> <project-name>` to use that template.

Current available templates include:

- [default] - Default template with all features.

- [material] - material template using preact-material-components

- [simple] - The simplest possible preact setup in a single file

- [widget] - Template for a widget to be embedded in another website.

> 💁 Tip: Any Github repo with a `'template'` folder can be used as a custom template: <br /> `preact create <username>/<repository> <project-name>`

### CLI Options

#### preact create

Create a project to quick start development.

```sh
$ preact create <template-name> <project-name>

  --name        The application name.
  --cwd         A directory to use instead of $PWD.
  --force       Force option to create the directory for the new app  [boolean] [default: false]
  --yarn        Installs dependencies with yarn.                      [boolean] [default: false]
  --git         Initialize version control using git.                 [boolean] [default: false]
  --install     Installs dependencies.                                [boolean] [default: true]
```

Note: If you don't specify enough data to the `preact create` command, it will prompt the required questions.

#### preact build

Create a production build

```sh
$ preact build

  --src             Entry file (index.js).                       [string]   [default: "src"]
  --dest            Directory root for output.                   [string]   [default: "build"]
  --prerenderUrls   Path to pre-render routes configuration.     [string]   [default: "prerender-urls.json"]
  --template        Path to template file.                       [string]   [default: none]
  --service-worker  Add a service worker to application.         [boolean]  [default: true]
  --production, -p  Create a minified production build.          [boolean]  [default: true]
  --no-prerender    Disable pre-render of static app content.    [boolean]  [default: false]
  --clean           Clear output directory before building.      [boolean]  [default: true]
  --json            Generate build statistics for analysis.      [boolean]  [default: false]
  --config, -c      Path to custom CLI config.
```

#### preact watch

Spin up a development server with multiple features like `hot-module-replacement`, `module-watcher`

```sh
$ preact watch

  --cwd         A directory to use instead of $PWD.              [string]   [default: .]
  --src         Entry file (index.js)                            [string]   [default: "src"]
  --port, -p    Port to start a server on                        [string]   [default: "8080"]
  --host,       Hostname to start a server on                    [string]   [default: "0.0.0.0"]
  --https       Use HTTPS?                                       [boolean]  [default: false]
  --prerender   Pre-render static app content on initial build   [boolean]  [default: false]
```

Note:

1. You can run dev server using `HTTPS` then you can use the following `HTTPS=true preact watch`
2. You can run the dev server on a different port using `PORT=8091 preact watch`

#### preact serve

Start a production version development server

```sh
$ preact serve

  --cwd       A directory to use instead of $PWD.                             [string]  [default: .]
  --dir       Directory root to serve static files from.                      [string]  [default: "build"]
  --server    Which server to run, or "config" to produce a firebase config.
              [options: "simplehttp2server", "superstatic", "config"]         [string]  [default: "simplehttp2server"]
  --dest      Directory or filename where firebase.json should be written
              (used for --server config)                                      [string]  [default: -]
  --port, -p  Port to start a server on.                                      [string]  [default: PORT || 8080]
```

#### preact list

Lists all the official preactjs-cli repositories

```sh
$ preact list
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

To make customizing your configuration easier, preact-cli supports plugins. Visit the [Plugins wiki] for a tutorial on how to use them.

#### Browserslist

You may customize your list of supported browser versions by declaring a [`"browserslist"`] key within your `package.json`. Changing these values will modify your JavaScript (via [`babel-preset-env`]) and your CSS (via [`autoprefixer`](https://github.com/postcss/autoprefixer)) output.

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

1. You may create a [`.babelrc`] file in your project's root directory. Any settings you define here will overwrite matching config-keys within [Preact CLI preset]. For example, if you pass a `"plugins"` object, it will replace & reset all Babel plugins that Preact CLI defaults to.

2. If you'd like to modify or add to the existing Babel config, you must use a `preact.config.js` file. Visit the [Webpack](#webpack) section for more info, or check out the [Customize Babel] example!

#### Webpack

To customize webpack create `preact.config.js` file which exports function that will change webpack's config.

```js
/**
 * Function that mutates original webpack config.
 * Supports asynchronous changes when promise is returned.
 *
 * @param {object} config - original webpack config.
 * @param {object} env - options passed to CLI.
 * @param {WebpackConfigHelpers} helpers - object with useful helpers when working with config.
 **/
export default function(config, env, helpers) {
	/** you can change config here **/
}
```

See [WebpackConfigHelpers] docs for more info on `helpers` argument which contains methods to find various parts of configuration. Additionally see our [recipes wiki] containing examples on how to change webpack configuration.

#### Prerender multiple routes

The `--prerender` flag will prerender by default only the root of your application.
If you want to prerender other routes you can create a `prerender-urls.json` file, which contains the set of routes you want to render.
The format required for defining your routes is an array of objects with a `url` key and an optional `title` key.

```js
// prerender-urls.json
[
	{
		url: '/',
		title: 'Homepage',
	},
	{
		url: '/route/random',
	},
];
```

You can customise the path of `prerender-urls.json` by using the flag `--prerenderUrls`.

```sh
preact build --prerenderUrls src/prerender-urls.json
```

#### Template

A template is used to render your page.

The default one is visible [here](src/resources/template.html) and it's going to be enough for the majority of cases.

If you want to customise your template you can pass a custom template with the `--template` flag.

The `--template` flag is available on the `build` and `watch` commands.

```sh
preact build --template src/template.html
preact watch --template src/template.html
```

[promise]: https://npm.im/promise-polyfill
[fetch]: https://github.com/developit/unfetch
[preact]: https://github.com/developit/preact
[webpackconfighelpers]: docs/webpack-helpers.md
[`.babelrc`]: https://babeljs.io/docs/usage/babelrc
[simple]: https://github.com/preactjs-templates/simple
[`"browserslist"`]: https://github.com/ai/browserslist
[```.babelrc```]: https://babeljs.io/docs/usage/babelrc
[default]: https://github.com/preactjs-templates/default
[sw-precache]: https://github.com/GoogleChrome/sw-precache
[preact-router]: https://github.com/developit/preact-router
[material]: https://github.com/preactjs-templates/material
[widget]: https://github.com/preactjs-templates/widget
[plugins wiki]: https://github.com/developit/preact-cli/wiki/Plugins
[preactjs-templates organization]: https://github.com/preactjs-templates
[preactjs-templates/default]: https://github.com/preactjs-templates/default
[recipes wiki]: https://github.com/developit/preact-cli/wiki/Config-Recipes
[prpl]: https://developers.google.com/web/fundamentals/performance/prpl-pattern
[`babel-preset-env`]: https://github.com/babel/babel-preset-env#targetsbrowsers
[proof]: https://googlechrome.github.io/lighthouse/viewer/?gist=142af6838482417af741d966e7804346
[preact cli preset]: https://github.com/developit/preact-cli/blob/master/src/lib/babel-config.js
[service workers]: https://developers.google.com/web/fundamentals/getting-started/primers/service-workers
[customize babel]: https://github.com/developit/preact-cli/wiki/Config-Recipes#customising-babel-options-using-loader-helpers
[`async!`]: https://github.com/developit/preact-cli/blob/222e7018dd360e40f7db622191aeca62d6ef0c9a/examples/full/src/components/app.js#L7
