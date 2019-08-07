import loaderUtils from 'loader-utils';

module.exports = function() {
	let { code, filename, cacheable } = loaderUtils.getOptions(this);
	if (cacheable === false) this.cacheable(false);
	this.resourcePath = filename;
	return code.replace(/__PREACT__BANG__/g, '!');
};
