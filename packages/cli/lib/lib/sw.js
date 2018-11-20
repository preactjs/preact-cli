self.__precacheManifest = [].concat(self.__precacheManifest || []);
if (process.env.ES_BUILD === true) {
  self.__precacheManifest = self.__precacheManifest.map(asset => {
    console.log(asset);
    if(/.*.js$/.test(asset.url)) {
      asset.url = asset.url.replace(/.js$/, ".esm.js.br")
    }
    return asset;
  });
}

workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerNavigationRoute("index.html", {
  whitelist: [/^(?!\/__).*/],
});
