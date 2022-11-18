const fetch = require('isomorphic-unfetch');
const { bold, magenta } = require('kleur');
const { error, info } = require('../util');

const REPOS_URL = 'https://api.github.com/users/preactjs-templates/repos';

module.exports = async function () {
	try {
		const repos = await fetch(REPOS_URL).then(r => r.json());

		process.stdout.write('\n');
		info('Available official templates: \n');

		repos
			.filter(repo => !repo.archived)
			.forEach(repo => {
				const description = repo.description ? ` - ${repo.description}` : '';
				process.stdout.write(
					`  ⭐️  ${bold(magenta(repo.name))}${description} \n`
				);
			});

		process.stdout.write('\n');
	} catch (err) {
		error((err && err.stack) || err.message || err, 1);
	}
};
