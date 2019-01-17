self.addEventListener('fetch', function(event) {
	var isPostRequest = event.request.method === 'POST';
	event.respondWith(
		fetch(event.request).catch(function(err) {
			if (err instanceof TypeError) {
				if (isPostRequest) {
					console.log(
						'⚛️Preact CLI development tip: A POST request just failed. This might fail for your users as well due to a network error. It may be worth exploring the backgroundSync API.'
					);
				} else {
					console.log(
						'⚛️Preact CLI development tip: A GET request just failed. This might fail for your users as well due to a network error. It may be worth adding runtimeCaching to your Service Worker.'
					);
				}
			}
			return err;
		})
	);
});
