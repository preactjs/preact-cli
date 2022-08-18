export default () => {
	// Uses WHATWG URL API
	// https://nodejs.org/api/url.html#the-whatwg-url-api
	if (
		location.hash === undefined ||
		location.host === undefined ||
		location.hostname === undefined ||
		location.href === undefined ||
		location.origin === undefined ||
		location.password === undefined ||
		location.pathname === undefined ||
		location.port === undefined ||
		location.protocol === undefined ||
		location.search === undefined ||
		location.searchParams === undefined ||
		location.username === undefined
	) {
		throw new Error('Incomplete Location object');
	}
	return <h1>Location test</h1>;
};
