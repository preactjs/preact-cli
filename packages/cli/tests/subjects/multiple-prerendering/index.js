import { h, Component } from 'preact';
import { Router } from 'preact-router';
import Home from './routes/home';
import Route66 from './routes/route66';
import Custom from './routes/custom';
import './style.css';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render(props) {
		return (
			<div id="app">
				<Router url={props.url} onChange={this.handleRoute} {...props}>
					<Home path="/" />
					<Route66 path="/route66" />
					<Custom path="/custom" {...props} />
				</Router>
			</div>
		);
	}
}
