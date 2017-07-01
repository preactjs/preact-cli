const colors = require('chalk');
const pkg = require('./package.json');

const version = parseFloat( process.version.substr(1) );
const minimum = parseFloat( pkg.engines.node.match(/\d+/g).join('.') );

module.exports = function () {
  if (version >= minimum) {
    return true;
  }

	const errorMessage = colors.yellow(`

		⚠️ preact-cli requires at least node@${minimum}!
		You have node@${version}

	`);

  // version not supported && exit
  process.stdout.write(errorMessage) + '\n';
  process.exit(1);
};
