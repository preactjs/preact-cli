---
'preact-cli': major
---

Alters CSS Module detection to instead rely upon file names, rather than directory names.

Treating all CSS files found within `routes/` and `components/` as CSS Modules was not obvious, nor did it offer an easy way to opt out (or in) without editing the Webpack config itself.

This change makes is so that users can opt into CSS Modules from anywhere in their app by instead naming their CSS files according to the pattern `*.module.css`.

Anyone using CSS Modules within `routes/` or `components/` will need to alter their CSS files to be `x.module.css`. If you've disabled CSS Modules in your `preact.config.js`, you can remove that bit of configuration and use file names to instead determine behavior.
