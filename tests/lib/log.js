/* eslint-disable no-console */
const withLog = async (operation, message) => {
	console.log(`${message} - started...`);

	try {
		let result = await operation();
		console.log(`${message} - done.`);
		return result;
	} catch (err) {
		console.error(`${message} - failed!`);
		throw err;
	}
};

export default withLog;
