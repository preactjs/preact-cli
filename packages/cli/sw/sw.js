import { getFiles, setupPrecaching, setupRouting } from './index';

setupRouting();
setupPrecaching(getFiles());
