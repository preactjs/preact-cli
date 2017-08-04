/* eslint-disable no-console */
import { shouldLog } from './tests-config';

export const withLog = async (operation, message) => {
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

export const log = (level, message) => {
	if (level === 'error' || shouldLog()) {
		console[level](message);
	}
};

export const delay = time => new Promise(r => setTimeout(() => r(), time));

export const waitUntil = async (action, errorMessage, retryCount = 10, retryInterval = 100) => {
	if (retryCount < 0) {
		throw new Error(errorMessage);
	}

	try {
		if (await action()) return;
	} catch (e) { }

	await delay(retryInterval);
	await waitUntil(action, errorMessage, retryCount - 1, retryInterval);
};
