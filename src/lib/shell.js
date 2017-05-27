import promisify from 'es6-promisify';
import which from 'which';

const commandExists = async cmd => {
	try {
		await promisify(which)(cmd);
		return true;
	} catch(e){
		return false;
	}
};

export { commandExists };
