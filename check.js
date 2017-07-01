import colors from "chalk";
import pkg from "./package.json";

export default function checkVersion() {
	const version = parseFloat( process.version.substr(1) );
	const minimum = parseFloat( pkg.engines.node.match(/\d+/g).join('.') );

  if (version >= minimum) {
		return true;
  }

	const errorMessage = colors.yellow(
		"\n⚠️ " +
			"preact-cli requires at least " +
			"node@" +
			minimum +
			"\n\n" +
			"Your node version is " +
			version +
		"\n"
	);

	// version not supported && exit
	process.stdout.write(errorMessage) + '\n';
	process.exit(1);
}
