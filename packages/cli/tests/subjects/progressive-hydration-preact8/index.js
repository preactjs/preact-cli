import Home from './routes/home';

if (typeof window !== 'undefined') {
	window.ROOT_MUTATION_COUNT = 0;
	const root = document.querySelector('#app');
	const old = root.removeChild;
	root.removeChild = child => {
		window.ROOT_MUTATION_COUNT++;
		old.call(this, child);
	};
}

export default function App() {
	return (
		<div id="app">
			<Home url="/" />
		</div>
	);
}
