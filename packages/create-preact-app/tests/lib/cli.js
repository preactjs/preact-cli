const { join } = require('path');
const { existsSync, unlinkSync } = require('fs');
const cmd = require('../../lib/commands');
const { tmpDir } = require('./output');

exports.create = async function (template, name) {
	let dest = tmpDir();
	name = name || `test-${template}`;

	await cmd.create(template, dest, { name, cwd: '.' });

	// TODO: temporary – will resolve after 2.x->3.x release
	// Templates are using 2.x, which needs `.babelrc` for TEST modification.
	// The 3.x templates won't need `.babelrc` for { modules: commonjs }
	let babelrc = join(dest, '.babelrc');
	existsSync(babelrc) && unlinkSync(babelrc);

	return dest;
};
