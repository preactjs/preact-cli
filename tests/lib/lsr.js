import fs from 'fs.promised';
import { difference } from 'lodash';
import { resolve } from 'path';

const lsr = async (path, excludes = []) => {
	let contents = difference(await fs.readdir(path), excludes);
	let stats = contents.reduce((agg, p) => Object.assign(agg, { [p]: {} }), {});

	for (let content of contents) {
		let contentPath = resolve(path, content);
		let contentStats = await fs.stat(contentPath);

		if (contentStats.isDirectory()) {
			stats[content] = {
				...(await lsr(contentPath, excludes))
			};
		} else {
			stats[content] = {
				size: contentStats.size
			};
		}
	}

	return stats;
};

export default lsr;
