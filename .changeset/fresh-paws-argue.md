---
"preact-cli": patch
---

Transpile generators and async functions in legacy bundles. Async functions were inadvertently transpiled to generators in 3.3.0, this transpiles them to ES5.
