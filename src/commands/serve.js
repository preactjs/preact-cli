const tmp = require('tmp');
const path = require('path');
const fs = require('fs.promised');
const { execFile } = require('child_process');
const persistencePath = require('persist-path');
const simplehttp2server = require('simplehttp2server');
const getCert = require('../lib/ssl-cert');
const { isDir } = require('../util');

/** Spawn an HTTP2 server.
 *	@param {object} argv
 *	@param {string} [argv.config]		Filename of a Firebase Hosting configuration, relative to cwd
 *	@param {string} [argv.cwd]			Directory to host intead of `process.cwd()`
 *	@param {string} [argv.dir='.']		Static asset directory, relative to `argv.cwd`
 *	@param {number|string} [argv.port]	Port to start the http server on
 */
module.exports = async function (dir, argv) {
	dir = path.resolve(argv.cwd, dir || argv.dir);

	// Allow overriding default hosting config via `--config firebase.json`:
	let configFile = argv.config || path.resolve(__dirname, '../resources/static-app.json');
	let config = await readJson(configFile);

	// Simplehttp2server can only load certs from its CWD, so we spawn it in lib/resources where the certs are located.
	// The "public" field is then set to the absolute path for our static file root.
	config.public = dir;

	// Load and apply Link headers from a push manifest if one exists:
	let pushManifest = await readJson(path.resolve(dir, 'push-manifest.json'));
	if (pushManifest) {
		config.headers = [].concat(
			config.headers || [],
			createHeadersFromPushManifest(pushManifest)
		);
	}

	// Switch configuration to be a temp file with the preload headers merged in:
	configFile = await tmpFile({ postfix: '.json' });
	await fs.writeFile(configFile, JSON.stringify(config));

	let port = argv.port || process.env.PORT;

	await serveHttp2({
		options: argv,
		config: configFile,
		configObj: config,
		server: argv.server,
		cors: argv.cors || `https://localhost:${port}`,
		port,
		dir,
		cwd: path.resolve(__dirname, '../resources')
	});
};

/** Produces an Array of Link rel=preload headers from a push manifest.
 *	Headers are in Firebase Hosting format.
 */
function createHeadersFromPushManifest(pushManifest) {
	let headers = [];

	for (let source in pushManifest) {
		if (pushManifest.hasOwnProperty(source)) {
			let file, links=[], section=pushManifest[source];

			for (file in section) {
				if (section.hasOwnProperty(file)) {
					links.push(
						Object.assign({ url:`/${file.replace(/^\//g,'')}` }, section[file])
					);
				}
			}

			links = links.sort( (a, b) => {
				let diff = b.weight - a.weight;
				if (!diff) {
					if (b.url.match(/bundle\.js$/)) return 1;
					return b.url.match(/\.js$/) ? 1 : 0;
				}
				return diff;
			});

			headers.push({
				source,
				headers: [{
					key: 'Link',
					value: links.map( ({ url, type }) =>
						`<${url}>; rel=preload; as=${type}`
					).join(', ')
				}]
			});
		}
	}

	return headers;
}


/** Start an HTTP2 static fileserver with push support.
 *	@param {object} options
 *	@param {string} [options.config]			Server configuration file in Firebase Hosting format.
 *	@param {number|string} [options.port=8080]	Port to run the server on.
 *	@param {string} [options.cwd=process.cwd()]	Directory from which to serve static files.
 */
function serveHttp2(options) {
	return Promise.resolve(options)
		.then(SERVERS[options.server || 'simplehttp2server'])
		.then(args => {
			return new Promise((resolve, reject) => {
				if (typeof args==='string') {
					process.stdout.write(args + '\n');
					return resolve();
				}

				let child = execFile(args[0], args.slice(1), {
					cwd: options.cwd,
					encoding: 'utf8'
				}, (err, stdout, stderr) => {
					if (err) process.stderr.write('\n  server error> '+err+'\n'+stderr);
					else process.stdout.write('\n  server spawned> '+stdout);

					if (err) return reject(err + '\n' + stderr);
					else resolve();
				});

				function proxy(type) {
					child[type].on('data', data => {
						data = data.replace(/^(\s*\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})?\s*/gm, '');
						if (data.match(/\bRequest for\b/gim)) return;
						process[type].write(`  \u001b[32m${data}\u001b[39m`);
					});
				}
				proxy('stdout');
				proxy('stderr');
				process.stdin.pipe(child.stdin);
			});
		});
}

const SERVERS = {
	async simplehttp2server(options) {
		let ssl = await getCert();
		if (ssl) {
			await fs.writeFile(path.resolve(options.cwd, 'key.pem'), ssl.key);
			await fs.writeFile(path.resolve(options.cwd, 'cert.pem'), ssl.cert);
		} else {
			options.cwd = persistencePath('preact-cli');
			process.stderr.write(`Falling back to shared directory + simplehttp2server.\n(dir: ${options.cwd})\n`);
		}

		return [
			simplehttp2server,
			'-cors', options.cors,
			'-config', options.config,
			'-listen', `:${options.port}`
		];
	},
	superstatic(options) {
		let conf = Object.assign(options.configObj, { public:undefined });
		return [
			'superstatic',
			path.relative(options.cwd, options.dir),
			'--gzip',
			'-p', options.port,
			'-c', JSON.stringify(conf)
		];
	},
	/** Writes the firebase/superstatic/simplehttp2server configuration to stdout or a file. */
	async config({ configObj, options }) {
		let dir = process.cwd(),
			outfile;
		if (options.dest && options.dest!=='-') {
			if (isDir(options.dest)) {
				dir = options.dest;
				outfile = 'firebase.json';
			} else {
				dir = path.dirname(options.dest);
				outfile = path.basename(options.dest);
			}
		}

    let config = await readJson(path.resolve(dir, outfile));
    let hosting = Object.assign({}, configObj, { public:path.relative(dir, configObj.public) });

    config = JSON.stringify(
      Object.assign({}, config, { hosting })
    );

		if (outfile) {
			await fs.writeFile(path.resolve(dir, outfile), config);
			return `Configuration written to ${outfile}.`;
		} else {
			return config;
		}
	}
};


/** Create a temporary file. See https://npm.im/tmp */
function tmpFile(opts) {
	return new Promise((res, rej) => {
		tmp.file(opts, (err, path) => err ? rej(err) : res(path));
	});
}


/** Safely read a JSON file. Failures simply return `undefined`. */
async function readJson(filename) {
	try {
		return JSON.parse(await fs.readFile(filename, 'utf8'));
	} catch (e) {}
}
