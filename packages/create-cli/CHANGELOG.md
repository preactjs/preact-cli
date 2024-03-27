# create-preact-cli

## 1.0.0

### Major Changes

- [#1647](https://github.com/preactjs/preact-cli/pull/1647) [`03b8f9d`](https://github.com/preactjs/preact-cli/commit/03b8f9d893e3a7351d5a5dfab126040f06f1c606) Thanks [@rschristian](https://github.com/rschristian)! - Extracts project creation functionality from `preact-cli` into `create-preact-cli`

  Setting up new `preact-cli` projects with `npx` is slow, as all dependencies of `preact-cli` would need to be installed, even though only a handful are used for project initialization. On the other hand, suggesting global installs is less than attractive due to NPM's poor default install location (requires `sudo`) and this can get out of sync over time.

  By extracting project initialization into its own package, we can provide much, much faster project setup times.

  To setup a new project, users will use `npm init preact-cli ...` or `yarn create preact-cli ...`.

  Additionally, the `--yarn` flag has been removed in favour of using the yarn initializer (`yarn create`).

### Patch Changes

- [#1816](https://github.com/preactjs/preact-cli/pull/1816) [`372d8fa`](https://github.com/preactjs/preact-cli/commit/372d8fa7744b53398ee42cd910f7cb65dddcd480) Thanks [@rschristian](https://github.com/rschristian)! - Removed `optimize-plugin`, now a single bundle will be output.
