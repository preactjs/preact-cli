---
'preact-cli': major
'create-preact-cli': major
---

Extracts project creation functionality from `preact-cli` into `create-preact-cli`

Setting up new `preact-cli` projects with `npx` is slow, as all dependencies of `preact-cli` would need to be installed, even though only a handful are used for project initialization. On the other hand, suggesting global installs is less than attractive due to NPM's poor default install location (requires `sudo`) and this can get out of sync over time.

By extracting project initialization into its own package, we can provide much, much faster project setup times.

To setup a new project, users will use `npm init preact-cli ...` or `yarn create preact-cli ...`.

Additionally, the `--yarn` flag has been removed in favour of using the yarn initializer (`yarn create`).
