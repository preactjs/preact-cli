'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs.promised');

var _fs2 = _interopRequireDefault(_fs);

var _webpack = require('webpack');

var _webpack2 = _interopRequireDefault(_webpack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = (() => {
	var _ref = _asyncToGenerator(function* (env, config, ssr = false) {
		let transformerPath = _path2.default.resolve(env.cwd, env.config || './preact.config.js');

		try {
			yield _fs2.default.stat(transformerPath);
		} catch (e) {
			if (env.config) {
				throw new Error(`preact-cli config could not be loaded!\nFile ${env.config} not found.`);
			}
			return;
		}

		require('babel-register')({
			presets: [require.resolve('babel-preset-env')]
		});
		const m = require(transformerPath);
		const transformer = m && m.default || m;
		try {
			yield transformer(config, Object.assign({}, env, { ssr }), new WebpackConfigHelpers(env.cwd));
		} catch (err) {
			throw new Error(`Error at ${transformerPath}: \n` + err);
		}
	});

	return function (_x, _x2) {
		return _ref.apply(this, arguments);
	};
})();

class WebpackConfigHelpers {
	constructor(cwd) {
		this._cwd = cwd;
	}

	get webpack() {
		return _webpack2.default;
	}

	getLoaders(config) {
		return this.getRules(config).map(({ rule, index }) => ({
			rule: rule,
			ruleIndex: index,
			loaders: rule.loaders || rule.use || rule.loader
		}));
	}

	getRules(config) {
		return [...(config.module.loaders || []), ...(config.module.rules || [])].map((rule, index) => ({ index, rule }));
	}

	getPlugins(config) {
		return (config.plugins || []).map((plugin, index) => ({ index, plugin }));
	}

	getRulesByMatchingFile(config, file) {
		let filePath = _path2.default.resolve(this._cwd, file);
		return this.getRules(config).filter(w => w.rule.test && w.rule.test.exec(filePath));
	}

	getLoadersByName(config, name) {
		return this.getLoaders(config).map(({ rule, ruleIndex, loaders }) => Array.isArray(loaders) ? loaders.map((loader, loaderIndex) => ({ rule, ruleIndex, loader, loaderIndex })) : [{ rule, ruleIndex, loader: loaders, loaderIndex: -1 }]).reduce((arr, loaders) => arr.concat(loaders), []).filter(({ loader }) => loader === name || loader && loader.loader === name);
	}

	getPluginsByName(config, name) {
		return this.getPlugins(config).filter(w => w.plugin && w.plugin.constructor && w.plugin.constructor.name === name);
	}

	getPluginsByType(config, type) {
		return this.getPlugins(config).filter(w => w.plugin instanceof type);
	}

	setHtmlTemplate(config, template) {
		let isPath;
		try {
			_fs2.default.statSync(template);
			isPath = true;
		} catch (e) {}

		let templatePath = isPath ? `!!ejs-loader!${_path2.default.resolve(this._cwd, template)}` : template;
		let htmlWebpackPlugin = this.getPluginsByName(config, 'HtmlWebpackPlugin')[0].plugin;

		htmlWebpackPlugin.options.template = templatePath;
	}
}