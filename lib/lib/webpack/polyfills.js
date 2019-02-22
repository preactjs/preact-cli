'use strict';

if (!global.Promise) global.Promise = require('promise-polyfill');
if (!global.fetch) global.fetch = require('isomorphic-unfetch');