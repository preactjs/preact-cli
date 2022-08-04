import { useEffect, useState } from 'preact/hooks';

export default () => {
	const [val, setVal] = useState('');

	useEffect(() => {
		fetch('/proxied/request')
			.then(res => res.text())
			.then(data => setVal(data));
	}, []);

	return <h1>Data retrieved from proxied server: {val}</h1>;
};
