---
'preact-cli': minor
---

Any environment variables prefixed with 'PREACT_APP_' will automatically be available for reference and use in your application without having to configure `DefinePlugin` any more. Furthermore, if a `.env` file exists in the root of your application, any variables it defines will automatically be available for use.

Huge shout out to [robinvdvleuten](https://github.com/robinvdvleuten) who provided this functionality through the [`preact-cli-plugin-env-vars`](https://github.com/robinvdvleuten/preact-cli-plugin-env-vars) package in the past.
