const polka = require('polka');
const sirv = require('sirv');

exports.getServer = (dir, port = 3000) => {
	return polka()
		.use(sirv(dir, { maxAge: 0 }))
		.listen(port);
};
