---
'preact-cli': patch
---

If `--prerenderUrls` file exists on the disk, but it cannot be processed (thrown errors, incorrect format, etc), the build should error out rather than continue with a warning.
