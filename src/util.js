import chalk from 'chalk';
import { statSync, existsSync } from 'fs';
import logSymbols from 'log-symbols';

export function isDir(str) {
	return existsSync(str) && statSync(str).isDirectory();
}

export function info(text, code) {
	process.stderr.write(logSymbols.info + chalk.blue(' INFO ') + text + '\n');
	process.exit(code || 1);
}

export function warn(text, code) {
	process.stdout.write(logSymbols.warning + chalk.yellow(' WARN ') + text + '\n');
	code && process.exit(code);
}

export function error(text, code) {
	process.stderr.write(logSymbols.error + chalk.red(' ERROR ') + text + '\n');
	process.exit(code || 1);
}
