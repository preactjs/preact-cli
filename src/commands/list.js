import axios from 'axios';
import { yellow, blue } from 'chalk';
import { error, info } from '../util';
import asyncCommand from '../lib/async-command';

const REPOS_URL = "https://api.github.com/users/preactjs-templates/repos";

export default asyncCommand({
	command: 'list',

	desc: 'List all official templates',

	async handler() {
		try {
			let repos = await axios.get(REPOS_URL);

			process.stdout.write('\n');
			info('Available official templates: \n');

			repos.data.map((repo => {
				process.stdout.write(`  ${yellow('★')}  ${blue(repo.name)} - ${repo.description} \n`);
			}));

			process.stdout.write('\n');
		} catch (err) {
			error(err, 1);
		}
	}
});
