import test from 'tape';
import { getSpawnedProcesses } from './lib/cli';

test.onFinish(() => getSpawnedProcesses().forEach(p => p.kill()));
