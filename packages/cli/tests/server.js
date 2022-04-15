const polka = require('polka');
const sirv = require('sirv');

exports.getServer = (dir, port = 3000) => {
	const opts = {
		maxAge: 0,
		single: true,
	};
	return polka()
		.use(sirv(dir, opts))
		.get('/proxied/request', (_req, res) => {
			res.end('Hello World!');
		})
		.listen(port);
};
