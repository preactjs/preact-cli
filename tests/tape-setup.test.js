import test from 'tape';
import { getSpawnedProcesses } from './lib/cli';

test.onFinish(() => {
	getSpawnedProcesses().forEach(async p => {
		await p.kill();
	});
});
