import { Component } from 'preact';
import { Router } from 'preact-router';
import Home from './routes/home';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render(props) {
		return (
			<div id="app">
				<Router url={props.url} onChange={this.handleRoute} {...props}>
					<Home path="/" />
				</Router>
			</div>
		);
	}
}
