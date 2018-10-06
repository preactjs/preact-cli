self.addEventListener('fetch', function (event) {
    var isPostRequest = event.request.method === 'POST';
    event.respondWith(fetch(event.request).catch(function (err) {
      if (err instanceof TypeError) {
        if (isPostRequest) {
          console.log('PREACT-CLI-FRIENDLY-MESSAGE(IMPROVEMENT): We saw that your POST API call failed. This might fail for your users as well due to a network error, may be you should look into backgroundSync');
        } else {
          console.log('PREACT-CLI-FRIENDLY-MESSAGE(IMPROVEMENT): We saw that your GET API call failed. This might fail for your users as well due to a network error, may be you should look into runtimeCaching');
        }
      }
      return err;
    }));
  });