import { h, Component } from 'preact';
import { Router } from 'preact-router';

const Home = () => <div>Home</div>;

const Route66 = () => <div>Route66</div>;

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render() {
		return (
			<div id="app">
				<Router onChange={this.handleRoute}>
					<Home path="/" />
					<Route66 path="/route66" />
				</Router>
			</div>
		);
	}
}
