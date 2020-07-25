if (!global.Promise) global.Promise = require('promise-polyfill').default;
if (!global.fetch) global.fetch = require('isomorphic-unfetch');
if (!global.regeneratorRuntime) global.regeneratorRuntime = require('regenerator-runtime');
