if (!global.Promise) global.Promise = require('promise-polyfill');
if (!global.fetch) global.fetch = interop(require('isomorphic-unfetch'));
function interop(m) { return m.default || m; }
