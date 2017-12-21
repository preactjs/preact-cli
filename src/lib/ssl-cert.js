import fs from 'fs.promised';
import { resolve } from 'path';
import { execFile } from 'child_process';
import persistencePath from 'persist-path';
import simplehttp2server from 'simplehttp2server';
import getDevelopmentCertificate from 'devcert-san';

export default async function getSslCert() {
	process.stdout.write('Setting up SSL certificate (may require sudo)...\n');
	try {
		return await getDevelopmentCertificate('preact-cli', {
			installCertutil: true
		});
	} catch (err) {
		process.stderr.write('Attempting to spawn simplehttp2server to generate cert.\n');
		try {
			return await spawnServerForCert();
		} catch (err) {
			process.stderr.write(`Failed to generate dev SSL certificate: ${err}\n`);
		}
	}
	return false;
}


const spawnServerForCert = () => new Promise( (resolve, reject) => {
	let cwd = persistencePath('preact-cli');
	let child = execFile(simplehttp2server, ['-listen', ':40210'], {
		cwd,
		encoding: 'utf8'
	}, (err, stdout, stderr) => {
		if (err) return reject(err);
		let timer = setTimeout( () => {
			reject('Error: certificate generation timed out.');
		}, 5000);
		async function check(chunk) {
			if (/listening/gi.match(chunk)) {
				clearTimeout(timer);
				child.kill();
				resolve({
					key: await fs.readFile(resolve(cwd, 'key.pem'), 'utf-8'),
					cert: await fs.readFile(resolve(cwd, 'cert.pem'), 'utf-8'),
					keyPath: resolve(cwd, 'key.pem'),
					certPath: resolve(cwd, 'cert.pem')
				});
			}
		}
		stdout.on('data', check);
		stderr.on('data', check);
	});
});
