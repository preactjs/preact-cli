import fetch from 'isomorphic-unfetch';
import { bold, magenta } from 'chalk';
import { error, info } from '../util';
import asyncCommand from '../lib/async-command';

const REPOS_URL = "https://api.github.com/users/preactjs-templates/repos";

export default asyncCommand({
	command: 'list',

	desc: 'List all official templates',

	async handler() {
		try {
			let repos = await fetch(REPOS_URL).then(r => r.json());

			process.stdout.write('\n');
			info('Available official templates: \n');

			repos.map(repo => {
				process.stdout.write(`  ⭐️  ${bold(magenta(repo.name))} - ${repo.description} \n`);
			});

			process.stdout.write('\n');
		} catch (err) {
			error(err, 1);
		}
	}
});
