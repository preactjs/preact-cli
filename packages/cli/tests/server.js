const polka = require('polka');
const sirv = require('sirv');

exports.getServer = dir => {
	return polka()
		.use(
			sirv(dir, {maxAge: 0})
		)
		.listen(3000);
};
