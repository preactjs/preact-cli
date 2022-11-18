---
'preact-cli': major
---

Reduces the `env` parameter of `preact.config.js` to only contain 3 values: `isProd`, `isWatch`, and `isServer`.

Previously, `env` contained many semi-duplicated values (`production` and `isProd`, etc) as well as values that were unlikely to be of much use to many users (what flags were set, for instance). Because of this, the signal-to-noise ratio was rather low which we didn't like. As such, we reduced `env` down to the most basic environment info: what type of build is `preact-cli` doing and for which environement?

If you customize your Webpack config using a `preact.config.js`, please be aware that you may need to update which values you consume from `env`.
