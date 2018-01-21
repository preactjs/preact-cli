const fs = require('fs.promised');
const { resolve } = require('path');
const { execFile } = require('child_process');
const persistencePath = require('persist-path');
const simplehttp2server = require('simplehttp2server');
const getDevelopmentCertificate = require('devcert-san');

function spawnServerForCert() {
	return new Promise((res, rej) => {
		let cwd = persistencePath('preact-cli');
		let child = execFile(simplehttp2server, ['-listen', ':40210'], {
			cwd,
			encoding: 'utf8'
		}, (err, stdout, stderr) => {
			if (err) return rej(err);
			let timer = setTimeout( () => {
				rej('Error: certificate generation timed out.');
			}, 5000);
			async function check(chunk) {
				if (/listening/gi.match(chunk)) {
					clearTimeout(timer);
					child.kill();
					res({
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
}

module.exports = async function () {
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
