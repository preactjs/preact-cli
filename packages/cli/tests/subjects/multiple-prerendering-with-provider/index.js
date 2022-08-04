import { Component } from 'preact';
import { Router } from 'preact-router';
import { Provider } from '@preact/prerender-data-provider';
import Home from './routes/home';
import Route66 from './routes/route66';
import Custom from './routes/custom';
import CustomWithHook from './routes/custom-with-hook';
import HtmlSafe from './routes/html-safe';
import './style.css';

export default class App extends Component {
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	render(props) {
		return (
			<Provider value={props}>
				<div id="app">
					<Router url={props.url} onChange={this.handleRoute} {...props}>
						<Home path="/" />
						<Route66 path="/route66" />
						<Custom path="/custom" />
						<CustomWithHook path="/customhook" />
						<HtmlSafe path="/htmlsafe" />
					</Router>
				</div>
			</Provider>
		);
	}
}
