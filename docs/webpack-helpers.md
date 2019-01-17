### Table of Contents

- [WebpackConfigHelpers](#webpackconfighelpers)
  - [webpack](#webpack)
  - [getLoaders](#getloaders)
  - [getRules](#getrules)
  - [getPlugins](#getplugins)
  - [getRulesByMatchingFile](#getrulesbymatchingfile)
  - [getLoadersByName](#getloadersbyname)
  - [getPluginsByName](#getpluginsbyname)
  - [getPluginsByType](#getpluginsbytype)
  - [setHtmlTemplate](#sethtmltemplate)
- [PluginWrapper](#pluginwrapper)
- [RuleWrapper](#rulewrapper)
- [LoaderWrapper](#loaderwrapper)

## WebpackConfigHelpers

WebpackConfigHelpers

**Parameters**

- `cwd`

### webpack

Webpack module used to create config.

Returns **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)**

### getLoaders

Returns wrapper around all loaders from config.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[LoaderWrapper](#loaderwrapper)>**

### getRules

Returns wrapper around all rules from config.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RuleWrapper](#rulewrapper)>**

### getPlugins

Returns wrapper around all plugins from config.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[PluginWrapper](#pluginwrapper)>**

### getRulesByMatchingFile

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).
- `file` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** path to test against loader. Resolved relatively to \$PWD.

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[RuleWrapper](#rulewrapper)>**

### getLoadersByName

Returns loaders that match provided name.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).
- `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of loader.

**Examples**

```javascript
helpers.getLoadersByName(config, 'less-loader');
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[LoaderWrapper](#loaderwrapper)>**

### getPluginsByName

Returns plugins that match provided name.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).
- `name` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of loader.

**Examples**

```javascript
helpers.getPluginsByName(config, 'HtmlWebpackPlugin');
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[PluginWrapper](#pluginwrapper)>**

### getPluginsByType

Returns plugins that match provided type.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).
- `type` **any** type of plugin.

**Examples**

```javascript
helpers.getPluginsByType(config, webpack.optimize.CommonsChunkPlugin);
```

Returns **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[PluginWrapper](#pluginwrapper)>**

### setHtmlTemplate

Sets template used by HtmlWebpackPlugin.

**Parameters**

- `config` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [webpack config](https://webpack.js.org/configuration/#options).
- `template` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** template path. See [HtmlWebpackPlugin docs](https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md).

## PluginWrapper

Wrapper around webpack's [plugin](https://webpack.js.org/configuration/plugins/#plugins).

Type: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

- `plugin` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [plugin entry](https://webpack.js.org/configuration/plugins/#plugins).
- `index` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** index of plugin in config.

## RuleWrapper

Wrapper around webpack's [rule](https://webpack.js.org/configuration/module/#module-rules).

Type: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

- `rule` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [rule entry](https://webpack.js.org/configuration/module/#module-rules).
- `index` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** index of rule in config.

## LoaderWrapper

Wrapper around webpack's [loader entry](https://webpack.js.org/configuration/module/#useentry).

Type: [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)

**Properties**

- `rule` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [rule entry](https://webpack.js.org/configuration/module/#module-rules).
- `ruleIndex` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** index of rule in config.
- `loader` **[object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** [loader entry](https://webpack.js.org/configuration/module/#useentry).
- `loaderIndex` **[number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)** index of loader in rule.
