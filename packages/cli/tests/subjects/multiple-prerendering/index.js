import { Component } from 'preact';
import { LocationProvider, Router } from 'preact-iso/router';
import { default as lazy, ErrorBoundary } from 'preact-iso/lazy';

const Home = lazy(() => import('./routes/home.js'));
const Route66 = lazy(() => import('./routes/route66.js'));
const Custom = lazy(() => import('./routes/custom.js'));
import './style.css';

export default class App extends Component {
	render(props) {
		return (
			<LocationProvider>
				<div id="app">
					<ErrorBoundary>
						<Router url={props.url} {...props}>
							<Home path="/" />
							<Route66 path="/route66" />
							<Custom path="/custom" {...props} />
						</Router>
					</ErrorBoundary>
				</div>
			</LocationProvider>
		);
	}
}
