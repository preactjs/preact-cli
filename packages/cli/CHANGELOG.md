# preact-cli

## 3.0.5

### Patch Changes

- [`57cb566`](https://github.com/preactjs/preact-cli/commit/57cb566a697ceebcd094057b9db48827897d5b5b) [#1490](https://github.com/preactjs/preact-cli/pull/1490) Thanks [@rschristian](https://github.com/rschristian)! - Adds the 'prerender' argument to the list of arguments to be validated against

## 3.0.4

### Patch Changes

- [`6670ba0`](https://github.com/preactjs/preact-cli/commit/6670ba0b9ee03f03f98cfec490aee996b58a17eb) [#1461](https://github.com/preactjs/preact-cli/pull/1461) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - fix: await copying of files in create command

* [`30fb1fc`](https://github.com/preactjs/preact-cli/commit/30fb1fc0a2ec101a46ecbb6539ffccc2aec215d7) [#1478](https://github.com/preactjs/preact-cli/pull/1478) Thanks [@rschristian](https://github.com/rschristian)! - No longer copies 'sw-debug.js' to output directory on prod builds. No functional changes, as it was not used.

- [`2c53b0a`](https://github.com/preactjs/preact-cli/commit/2c53b0a94952c19f8e625dfa52ecbc0ae8c0c3cb) [#1438](https://github.com/preactjs/preact-cli/pull/1438) Thanks [@VanTanev](https://github.com/VanTanev)! - fix: allow an async component to return null rendering

* [`fce7e7a`](https://github.com/preactjs/preact-cli/commit/fce7e7a2a1b3f5cbe9856004a89723ef75b016bf) [#1460](https://github.com/preactjs/preact-cli/pull/1460) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - chore: remove preact-compat as it's unused

- [`ab84275`](https://github.com/preactjs/preact-cli/commit/ab84275c7d84c99a57085f9913d93069d461fb95) [#1434](https://github.com/preactjs/preact-cli/pull/1434) Thanks [@rschristian](https://github.com/rschristian)! - This disable SSR size tracking. This stops `size-plugin-ssr.json` from being generated and stops file sizes from being reported to the developer.

* [`67fafc8`](https://github.com/preactjs/preact-cli/commit/67fafc8e3d0d98665a193e10bc7c9a1ce2aeeedf) [#1467](https://github.com/preactjs/preact-cli/pull/1467) Thanks [@prateekbh](https://github.com/prateekbh)! - Allow only valid options for commands.

## 3.0.2

### Patch Changes

- [`07c9a9c`](https://github.com/preactjs/preact-cli/commit/07c9a9c87081d38ecb1729f57091f3984d454428) [#1413](https://github.com/preactjs/preact-cli/pull/1413) Thanks [@JoviDeCroock](https://github.com/JoviDeCroock)! - patch cleanFilename to also fix typescript and jsx files

- [`ff79f0b`](https://github.com/preactjs/preact-cli/commit/ff79f0b2f6f0f8877001d075947274306884cf89) [#1406](https://github.com/preactjs/preact-cli/pull/1406) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - Fix the prefresh integration, using `--refresh` should now correctly enable fast-refresh
