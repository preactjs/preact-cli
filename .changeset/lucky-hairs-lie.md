---
'preact-cli': patch
---

Reverts automatic conversion of `--sw` flag in dev to a boolean, which stopped the debug service worker from attaching.
