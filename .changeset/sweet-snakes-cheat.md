---
'preact-cli': major
---

- Upgrades to Webpack v5
  - Any custom configuration you do in your `preact.config.js` may need to be altered to account for this. Plugins may need replacements or different option formats.

- `--esm` flag has been removed
  - Dual output is now enabled by default in production builds.

- `.babelrc` no longer overwrites matching keys
  - Instead, the config will be merged in to the default. The default still takes precedence when there are conflicts, so you will still need to use your `preact.config.js` if you want to edit or remove default plugins or presets.
