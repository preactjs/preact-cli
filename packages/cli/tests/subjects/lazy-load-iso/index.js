import { LocationProvider, Router } from 'preact-iso/router';
import { default as lazy, ErrorBoundary } from 'preact-iso/lazy';

// Asynchronous, code-splitted:
const A = lazy(() => import('./a.js'));
const B = lazy(() => import('./b.js'));

export default function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<Router>
					<A path="/" />
					<B path="/b" />
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
}
