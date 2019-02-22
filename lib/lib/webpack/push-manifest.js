'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

module.exports = class PushManifestPlugin {
	apply(compiler) {
		compiler.plugin('emit', function (compilation, callback) {
			let routes = [],
			    mainJs,
			    mainCss;

			for (let filename in compilation.assets) {
				if (!/\.map$/.test(filename)) {
					if (/route-/.test(filename)) {
						routes.push(filename);
					} else if (/^style(.+)\.css$/.test(filename)) {
						mainCss = filename;
					} else if (/^bundle(.+)\.js$/.test(filename)) {
						mainJs = filename;
					}
				}
			}

			let defaults = {
				[mainCss]: {
					type: 'style',
					weight: 1
				},
				[mainJs]: {
					type: 'script',
					weight: 1
				}
			},
			    manifest = {
				'/': defaults
			};

			routes.forEach(filename => {
				let path = filename.replace(/route-/, '/').replace(/\.chunk(\.\w+)?\.js$/, '').replace(/\/home/, '/');
				manifest[path] = _extends({}, defaults, {
					[filename]: {
						type: "script",
						weight: 0.9
					}
				});
			});

			let output = JSON.stringify(manifest);
			compilation.assets['push-manifest.json'] = {
				source() {
					return output;
				},
				size() {
					return output.length;
				}
			};

			callback();
		});
	}
};