/* eslint-disable no-console */
import { shouldLog } from './tests-config';

const withLog = async (operation, message) => {
	log('info', `${message} - started...`);

	try {
		let result = await operation();
		log('info', `${message} - done.`);
		return result;
	} catch (err) {
		log('error', `${message} - failed!`);
		throw err;
	}
};

const log = (level, message) => {
	if (level === 'error' || shouldLog()) {
		console[level](message);
	}
};

export default withLog;
