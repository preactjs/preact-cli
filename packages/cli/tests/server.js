const polka = require('polka');
const sirv = require('sirv');

exports.getServer = dir => {
	return polka()
		.use(
			sirv(dir, {
				maxAge: 100,
				immutable: true,
			})
		)
		.listen(3000);
};
