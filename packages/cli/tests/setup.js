// const { join } = require('path');
// const rimraf = require('rimraf');

//rimraf.sync(join(__dirname, 'output'));

jasmine.DEFAULT_TIMEOUT_INTERVAL = 240 * 1000;

if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
	process.on('unhandledRejection', err => {
		throw err;
	});

	process.env.LISTENING_TO_UNHANDLED_REJECTION = true;
}
