---
'preact-cli': major
---

Minimum supported Node version for `preact-cli` is now v14.14.0. Please upgrade if you are on an older version.

`build` and `watch` commands will no longer take an optional `src` directory argument; if you want to change the source directory from the default (`./src`), please instead use the `--src` flag (i.e., `--src differentSrc`).

Upon rebuild, the output directory will no longer be outright deleted; instead, it will be emptied. This has the benefit of better supporting containerized environments where specific directories are mounted. Emptying the directory, rather than deleting and recreating it, ensures a stable reference for those tools.
