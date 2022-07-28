---
'preact-cli': patch
---

Fix ensures that the load-manifest is only attempted to be built in prod. It serves no use in dev (as preloading is limited to prod) and can create a race condition when used alongside HMR.
