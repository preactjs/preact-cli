---
'preact-cli': minor
---

TypeScript is now an optional peer dependency, rather than a direct dependency, of `preact-cli`.

If you use TypeScript in your projects (`.ts` or `.tsx`), you will need to have your own version of TypeScript installed and added to your `package.json`. This gives you greator control over the version of TypeScript used and most already have TypeScript listed as a dependency anyways.

For those not using TypeScript, no change is needed, and this should make your `node_modules` directory a bit smaller (~20% w/ barebones dependency list).
