import chalk from 'chalk';
import { statSync, existsSync } from 'fs';
import logSymbols from 'log-symbols';
import which from 'which';

export function isDir(str) {
	return existsSync(str) && statSync(str).isDirectory();
}

export function hasCommand(str) {
	return !!which.sync(str, { nothrow:true });
}

export function trim(str) {
	return str.trim().replace(/^\t+/gm, '');
}

export function info(text, code) {
	process.stderr.write(logSymbols.info + chalk.blue(' INFO ') + text + '\n');
	code && process.exit(code);
}

export function warn(text, code) {
	process.stdout.write(logSymbols.warning + chalk.yellow(' WARN ') + text + '\n');
	code && process.exit(code);
}

export function error(text, code) {
	process.stderr.write(logSymbols.error + chalk.red(' ERROR ') + text + '\n');
	code && process.exit(code);
}
