import Home from './routes/home';

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
		console.log('BOOTED');
		window.booted = true;
	}, 10);
}

export default function App() {
	return (
		<div id="app">
			<Home url="/" />
		</div>
	);
}
