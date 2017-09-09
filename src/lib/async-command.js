function done(err, result) {
	if (err) {
		process.stderr.write(String(err) + '\n');
		process.exit(err.exitCode || 1);
	}
	else {
		if (result) process.stdout.write(result + '\n');
		process.exit(0);
	}
}

export default function asyncCommand(options) {
	return {
		...options,
		handler(argv) {
			let r = options.handler(argv, done);
			if (r && r.then) r.then(result => done(null, result), done);
		}
	};
}
