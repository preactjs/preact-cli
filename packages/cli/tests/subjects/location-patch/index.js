import { h } from 'preact';

export default () => {
	if (
		location.protocol === undefined ||
		location.slashes === undefined ||
		location.auth === undefined ||
		location.host === undefined ||
		location.port === undefined ||
		location.hostname === undefined ||
		location.hash === undefined ||
		location.query === undefined ||
		location.pathname === undefined ||
		location.path === undefined ||
		location.href === undefined
	) {
		throw new Error('Incomplete Location object');
	}
	return <h1>Location test</h1>;
};
