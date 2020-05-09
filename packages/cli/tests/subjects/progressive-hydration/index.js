import { Router } from 'preact-router';
import Home from './routes/home';
import Route66 from './routes/route66';
import Custom from './routes/custom';

if (typeof window !== 'undefined') {
	window.mutations = [];
	window.nativeMutations = [];

	const serialize = val => {
		if (val instanceof NodeList) return [].map.call(val, serialize);
		if (val instanceof Node) {
			if (val.splitText) return val;
			return val.outerHTML.match(/.*?>/)[0];
		}
		if (Array.isArray(val)) return val.map(serialize);
		if (val != null && typeof val == 'object') {
			let node = {};
			for (let i in val) node[i] = serialize(val[i]);
			return node;
		}
		return val;
	};

	const observer = new MutationObserver(records => {
		for (let mutation of records) {
			const m = serialize(mutation);
			for (let i in m)
				if (m[i] == null || (Array.isArray(m[i]) && !m[i].length)) delete m[i];
			window.mutations.push(m);
			window.nativeMutations.push(mutation);
		}
	});
	observer.observe(document.body, {
		attributes: true,
		childList: true,
		subtree: true,
	});

	setTimeout(() => {
		// eslint-disable-next-line
		console.log('BOOTED');
		window.booted = true;
	}, 10);
}

export default function App({ url, ...props }) {
	return (
		<div id="app">
			<nav>
				<a href="/">home</a>
				<a href="/route66">home</a>
				<a href="/custom">home</a>
			</nav>
			<Router url={url}>
				<Home path="/" />
				<Route66 path="/route66" />
				<Custom path="/custom" {...props} />
			</Router>
		</div>
	);
}
