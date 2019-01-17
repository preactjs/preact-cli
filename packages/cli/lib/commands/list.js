const fetch = require('isomorphic-unfetch');
const { bold, magenta } = require('chalk');
const { error, info } = require('../util');

const REPOS_URL = 'https://api.github.com/users/preactjs-templates/repos';

module.exports = async function() {
	try {
		let repos = await fetch(REPOS_URL).then(r => r.json());

		process.stdout.write('\n');
		info('Available official templates: \n');

		repos.map(repo => {
			process.stdout.write(
				`  ⭐️  ${bold(magenta(repo.name))} - ${repo.description} \n`
			);
		});

		process.stdout.write('\n');
	} catch (err) {
		error(err, 1);
	}
};
