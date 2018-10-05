self.addEventListener('fetch', function(event){
    const isJsonRequest = event.request.headers.get('content-type') === 'application/json';
    const isPostRequest = event.request.method === 'POST';
    event.respondWith(fetch(event.request).then(function(response){
        return response;
    }).catch(function(err){
        console.error(err);
        if (!navigator.onLine && isJsonRequest) {
            if (isPostRequest) {
                console.log('May be you should look into backgroundSync');
            } else {
                console.log('Maybe you should look into runtimeCaching');
            }
        }
    }));
});