import { execSync } from "child_process";

import semver from "semver";
import colors from "chalk";
import pkg from "./../../package.json";

const platformSuffix = process.platform === "win32" ? ".cmd" : "";
const node = "node" + platformSuffix;

export default function checkVersion() {
  const requirements = pkg.engines;
  const nodeVersion = execSync(node + " --version").toString() || '';

  if ( !(semver.satisfies(nodeVersion, requirements.node)) ) {
    const errorMessage = colors.yellow(
      "\n⚠️ " +
        "preact-cli requires at least " +
        "node@" +
        requirements.node +
        "\n\n" +
        "Your node version is " +
        nodeVersion +
      "\n"
    );
		process.stdout.write(errorMessage) + '\n';
		process.exit(1);
  }

	return true;
}
