---
'preact-cli': major
---

To increase transparency and user control over the `template.html`, `<% preact.headEnd %>` and `<% preact.bodyEnd %>` will no longer be supported; instead, users should directly adopt the EJS and keep it in their templates.

In the past, these were abstracted away as they were a bit unwieldy; EJS might be unfamiliar with users and the way data was retrieved from `html-webpack-plugin` was somewhat less than elegant. However, this has much improved over the years and the abstraction only makes simple edits less than obvious, so it is no longer fulfilling it's purpose.

New projects will have a `template.ejs` created in place of the old `template.html`, containing the full EJS template. For existing projects, you can copy [the default `template.ejs`](https://github.com/preactjs/preact-cli/blob/master/packages/cli/src/resources/template.ejs) into your project or adapt it as you wish.
