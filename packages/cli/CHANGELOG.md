# preact-cli

## 3.4.1

### Patch Changes

- [#1711](https://github.com/preactjs/preact-cli/pull/1711) [`5eb5d00`](https://github.com/preactjs/preact-cli/commit/5eb5d00b80bfd35ead1269fbb178973be149f013) Thanks [@rschristian](https://github.com/rschristian)! - Fix ensures that the load-manifest is only attempted to be built in prod. It serves no use in dev (as preloading is limited to prod) and can create a race condition when used alongside HMR.

## 3.4.0

### Minor Changes

- [#1674](https://github.com/preactjs/preact-cli/pull/1674) [`0346549`](https://github.com/preactjs/preact-cli/commit/0346549a2a42b7cb1edf48df5871c47a621df57d) Thanks [@rschristian](https://github.com/rschristian)! - Supports consuming "proxy" from package.json to proxy API requests in watch mode

* [#1671](https://github.com/preactjs/preact-cli/pull/1671) [`8d3bd42`](https://github.com/preactjs/preact-cli/commit/8d3bd42759c72ed0cf2f7b8e6be11e109090c2e9) Thanks [@rschristian](https://github.com/rschristian)! - Any environment variables prefixed with 'PREACT*APP*' will automatically be available for reference and use in your application without having to configure `DefinePlugin` any more. Furthermore, if a `.env` file exists in the root of your application, any variables it defines will automatically be available for use.

  Huge shout out to [robinvdvleuten](https://github.com/robinvdvleuten) who provided this functionality through the [`preact-cli-plugin-env-vars`](https://github.com/robinvdvleuten/preact-cli-plugin-env-vars) package in the past.

### Patch Changes

- [#1667](https://github.com/preactjs/preact-cli/pull/1667) [`a56d904`](https://github.com/preactjs/preact-cli/commit/a56d904ee0a213109a0e6090ab4e8e575b382001) Thanks [@rschristian](https://github.com/rschristian)! - Allows users to author prerender-urls.js as ESM once again

* [#1693](https://github.com/preactjs/preact-cli/pull/1693) [`6385ec1`](https://github.com/preactjs/preact-cli/commit/6385ec1ce19f3b0b196b7dd5370b5694b34986c2) Thanks [@rschristian](https://github.com/rschristian)! - Bumps dependencies to latest versions where possible and applicable.

- [#1680](https://github.com/preactjs/preact-cli/pull/1680) [`fcd0375`](https://github.com/preactjs/preact-cli/commit/fcd0375a947b9d7778fb4a393999468fc48ad79f) Thanks [@rschristian](https://github.com/rschristian)! - Fixed bug in push-manifest that would result in undefined entries

* [#1670](https://github.com/preactjs/preact-cli/pull/1670) [`7afd8bb`](https://github.com/preactjs/preact-cli/commit/7afd8bbf979cb36f1a3dd3b29de2f3db8368de48) Thanks [@rschristian](https://github.com/rschristian)! - Corrects 'build --json' ouput location and 'apple-touch-icon' will respect the publicPath automatically

- [#1700](https://github.com/preactjs/preact-cli/pull/1700) [`a60f8df`](https://github.com/preactjs/preact-cli/commit/a60f8df8e87935f3b3e03a2bb4aecda801568c83) Thanks [@rschristian](https://github.com/rschristian)! - Removes the archived & non-recommended 'material' template from 'preact list' output

* [#1426](https://github.com/preactjs/preact-cli/pull/1426) [`7d33cd1`](https://github.com/preactjs/preact-cli/commit/7d33cd1380b5dc7d4b4b970eceabfc8f126da1af) Thanks [@VanTanev](https://github.com/VanTanev)! - Improves prerender error message when offending use of browser globals cannot be found

- [#1705](https://github.com/preactjs/preact-cli/pull/1705) [`f9ef9b1`](https://github.com/preactjs/preact-cli/commit/f9ef9b1d7de50d2e15ea53a51ca07b8a58345f2c) Thanks [@rschristian](https://github.com/rschristian)! - Fixes HMR / `--refresh` flag in watch mode

## 3.3.5

### Patch Changes

- [#1659](https://github.com/preactjs/preact-cli/pull/1659) [`d452863`](https://github.com/preactjs/preact-cli/commit/d4528639536e72824d6559ab7cb77c0e4ad8a865) Thanks [@rschristian](https://github.com/rschristian)! - Corrects `push-manifest.json` generation in non-ESM builds

* [#1658](https://github.com/preactjs/preact-cli/pull/1658) [`6af4e9d`](https://github.com/preactjs/preact-cli/commit/6af4e9de4342cf213ef9771bd22758472d4083a0) Thanks [@rschristian](https://github.com/rschristian)! - Clarifies when the `--template` flag is necessary in the CLI help information.

## 3.3.4

### Patch Changes

- [#1646](https://github.com/preactjs/preact-cli/pull/1646) [`e98994a`](https://github.com/preactjs/preact-cli/commit/e98994aacd48f8dbd509a291b662ea900f833c87) Thanks [@rschristian](https://github.com/rschristian)! - Bumping `webpack-dev-server`

* [#1635](https://github.com/preactjs/preact-cli/pull/1635) [`00bea83`](https://github.com/preactjs/preact-cli/commit/00bea83baa1d8ce8774453ee9542880da1314b7f) Thanks [@rschristian](https://github.com/rschristian)! - Ensures TS warnings/errors are not hidden by console clearing

- [#1634](https://github.com/preactjs/preact-cli/pull/1634) [`8a6732b`](https://github.com/preactjs/preact-cli/commit/8a6732bcc75171035ba21911a600a2177247ddc2) Thanks [@rschristian](https://github.com/rschristian)! - Ensures types are published with package

* [#1648](https://github.com/preactjs/preact-cli/pull/1648) [`e19ceb0`](https://github.com/preactjs/preact-cli/commit/e19ceb089b45e8a26c309cb533eab01d6e09bd29) Thanks [@rschristian](https://github.com/rschristian)! - Ensures the public path is normalized when registering service workers

## 3.3.3

### Patch Changes

- [#1624](https://github.com/preactjs/preact-cli/pull/1624) [`0b298ae`](https://github.com/preactjs/preact-cli/commit/0b298aeb6f54bc4b7f6112222f3fe854aae3d744) Thanks [@rschristian](https://github.com/rschristian)! - Added typings for users to use in their preact.config.js files

* [#1622](https://github.com/preactjs/preact-cli/pull/1622) [`39be928`](https://github.com/preactjs/preact-cli/commit/39be928638e8584528af65a1e313981255a5cc24) Thanks [@rschristian](https://github.com/rschristian)! - Corrects module resolve priority, fixing issues with duplicated dependencies being incorrectly resolved

- [#1619](https://github.com/preactjs/preact-cli/pull/1619) [`9039ba2`](https://github.com/preactjs/preact-cli/commit/9039ba2e18bf1bf21b76425562617ad46e9d1d7c) Thanks [@rschristian](https://github.com/rschristian)! - Fixing legacy SW generation while ESM is enabled

* [#1618](https://github.com/preactjs/preact-cli/pull/1618) [`11d5f3b`](https://github.com/preactjs/preact-cli/commit/11d5f3b67811779d9caec24d62acfdb9715b128a) Thanks [@rschristian](https://github.com/rschristian)! - Corrects error when `src/sw.js` does not exist and esm is disabled

## 3.3.2

### Patch Changes

- [#1508](https://github.com/preactjs/preact-cli/pull/1508) [`0cfee78`](https://github.com/preactjs/preact-cli/commit/0cfee78f5c695147fd610284530b01d7b2396b3d) Thanks [@rschristian](https://github.com/rschristian)! - On project create, the CLI won't copy the HTML template or the service worker when the source template is a widget

* [#1612](https://github.com/preactjs/preact-cli/pull/1612) [`a4a66ce`](https://github.com/preactjs/preact-cli/commit/a4a66ce9fff3320731b8776b14abf59ad6773572) Thanks [@rschristian](https://github.com/rschristian)! - Changes port config precedence to: --port -> \$PORT -> 8080 (default)

- [#1613](https://github.com/preactjs/preact-cli/pull/1613) [`3994a23`](https://github.com/preactjs/preact-cli/commit/3994a233d626bc6d28bcfac1e1d876944b0d71ad) Thanks [@rschristian](https://github.com/rschristian)! - Removing old & non-functional config helper `setHtmlTemplate`

## 3.3.1

### Patch Changes

- [#1599](https://github.com/preactjs/preact-cli/pull/1599) [`e42a61c`](https://github.com/preactjs/preact-cli/commit/e42a61c1f6c97b1a4cce16e3e45d2b13a094d623) Thanks [@rschristian](https://github.com/rschristian)! - Reverts automatic conversion of `--sw` flag in dev to a boolean, which stopped the debug service worker from attaching.

## 3.3.0

### Minor Changes

- [#1580](https://github.com/preactjs/preact-cli/pull/1580) [`95198f3`](https://github.com/preactjs/preact-cli/commit/95198f36fa608f6edddfe527517b42fc48b2588d) Thanks [@developit](https://github.com/developit)! - Generate modern (approximately ES2017) code in development mode to better match production output.

* [#1574](https://github.com/preactjs/preact-cli/pull/1574) [`5117f46`](https://github.com/preactjs/preact-cli/commit/5117f46a289fa8ec91e3c67e4344f9d2ecc0385e) Thanks [@rschristian](https://github.com/rschristian)! - Removes Safari nomodule polyfill from template

- [#1347](https://github.com/preactjs/preact-cli/pull/1347) [`1276aa3`](https://github.com/preactjs/preact-cli/commit/1276aa330cf95ae25fc70d6b621d43065c0556a4) Thanks [@teodragovic](https://github.com/teodragovic)! - Remove fast-async

### Patch Changes

- [#1595](https://github.com/preactjs/preact-cli/pull/1595) [`6d100d0`](https://github.com/preactjs/preact-cli/commit/6d100d0876939b3b71e5419c58872aa014773f60) Thanks [@rschristian](https://github.com/rschristian)! - Ensuring the sw flag is a boolean in watch mode

* [#1573](https://github.com/preactjs/preact-cli/pull/1573) [`022d9a8`](https://github.com/preactjs/preact-cli/commit/022d9a8119ea9a4e09963ffbe5ee9adbc9fb0d92) Thanks [@rschristian](https://github.com/rschristian)! - Uses native FS promise API rather than promisifying manually

## 3.2.2

### Patch Changes

- [#1568](https://github.com/preactjs/preact-cli/pull/1568) [`bc6d5f6`](https://github.com/preactjs/preact-cli/commit/bc6d5f6e87e9cd5dc652d7e294fff150b7068c4d) Thanks [@rschristian](https://github.com/rschristian)! - Fixes breaking change to the getLoadersByName config helper

## 3.2.1

### Patch Changes

- [#1567](https://github.com/preactjs/preact-cli/pull/1567) [`971e633`](https://github.com/preactjs/preact-cli/commit/971e6335ddd20e8cc0233607c47942831e31f4cb) Thanks [@rschristian](https://github.com/rschristian)! - Reverts update to fork-ts-checker-webpack-plugin

## 3.2.0

### Minor Changes

- [#1465](https://github.com/preactjs/preact-cli/pull/1465) [`3a11043`](https://github.com/preactjs/preact-cli/commit/3a11043f89deee09bc41947677e1a3a58b4ee1bf) Thanks [@ForsakenHarmony](https://github.com/ForsakenHarmony)! - chore: update dependencies

## 3.1.0

### Minor Changes

- [`4b81641`](https://github.com/preactjs/preact-cli/commit/4b8164172ec4e7e9a725909b58bc54eb1f82ed8a) [#1418](https://github.com/preactjs/preact-cli/pull/1418) Thanks [@merceyz](https://github.com/merceyz)! - Added monorepo and Yarn PnP support by correctly loading dependencies, removing faulty install checks, and adding undeclared dependencies

### Patch Changes

- [`0e4f06a`](https://github.com/preactjs/preact-cli/commit/0e4f06a60bb08869831d66844b6b92a948f33e4c) [#1503](https://github.com/preactjs/preact-cli/pull/1503) Thanks [@rschristian](https://github.com/rschristian)! - Ensures the create command returns startup instructions to users

* [`df48437`](https://github.com/preactjs/preact-cli/commit/df484371553a72f3fa5a72effe9577530d95f648) [#1499](https://github.com/preactjs/preact-cli/pull/1499) Thanks [@rschristian](https://github.com/rschristian)! - CLI now only conditionally outputs 200.html & preact_prerender_data.json

- [`c33f020`](https://github.com/preactjs/preact-cli/commit/c33f0207d26402f9b27827acd52303dfd6350c38) [#1435](https://github.com/preactjs/preact-cli/pull/1435) Thanks [@rschristian](https://github.com/rschristian)! - Change ensures root ReadMe is bundled with CLI package on publish

* [`bf668b1`](https://github.com/preactjs/preact-cli/commit/bf668b1e9eda89e45bf6711decc6ee53d76a5880) [#1530](https://github.com/preactjs/preact-cli/pull/1530) Thanks [@rschristian](https://github.com/rschristian)! - Fixes bug causing wrong port to be given to Webpack config

- [`cc2f3e7`](https://github.com/preactjs/preact-cli/commit/cc2f3e787c25696d68aaae6e17c8466b2b6675ac) [#1423](https://github.com/preactjs/preact-cli/pull/1423) Thanks [@rschristian](https://github.com/rschristian)! - Fixes bug with style loader that would strip non-module CSS files if 'sideEffects' was set to false for the package.

* [`c9c48db`](https://github.com/preactjs/preact-cli/commit/c9c48db444b96201d5f478cdb73f668195dcdee2) [#1504](https://github.com/preactjs/preact-cli/pull/1504) Thanks [@rschristian](https://github.com/rschristian)! - Replacing mkdirp with native mkdir recursive

- [`977d59a`](https://github.com/preactjs/preact-cli/commit/977d59a30ec5062569dea62c40359f2be3b2d87e) [#1527](https://github.com/preactjs/preact-cli/pull/1527) Thanks [@jamesgeorge007](https://github.com/jamesgeorge007)! - Do not prompt on supplying the template as an argument

* [`daa51ac`](https://github.com/preactjs/preact-cli/commit/daa51ac4aa5ea10c824f7a33bfc03d71d0aaf5ae) [#1522](https://github.com/preactjs/preact-cli/pull/1522) Thanks [@jamesgeorge007](https://github.com/jamesgeorge007)! - Minor typographical fix

- [`24c7473`](https://github.com/preactjs/preact-cli/commit/24c7473f27fa401449a6da82b37b897b5a45894b) [#1516](https://github.com/preactjs/preact-cli/pull/1516) Thanks [@jgoamakf](https://github.com/jgoamakf)! - Do not produce preRenderData when --no-prerender option is specified.

* [`9f9277b`](https://github.com/preactjs/preact-cli/commit/9f9277be2ed50476147bae5567640b36740b4d38) [#1534](https://github.com/preactjs/preact-cli/pull/1534) Thanks [@rschristian](https://github.com/rschristian)! - Fixes SW flag in dev

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
