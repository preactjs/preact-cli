import which from 'which';

const commandExists = async cmd => {
	try {
		await Promise.promisify(which)(cmd);
		return true;
	} catch (e){
		return false;
	}
};

export { commandExists };
