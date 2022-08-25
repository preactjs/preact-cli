---
'preact-cli': major
---

Removes support for automatic async routes via `@preact/async-loader`.

Instead of magic directories, users can use `preact-iso`'s `lazy()` to split routes & components as they wish from anywhere.

This should be a lot more powerful and transparent compared to the previous setup.

```js
// before
import Home from './routes/home';

// after
import { lazy } from 'preact-iso';
const Home = lazy(() => import('./routes/home.js'));
```
