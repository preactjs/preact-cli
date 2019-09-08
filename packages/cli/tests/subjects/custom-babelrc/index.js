import { h, Component } from 'preact';

const delay = t => new Promise(r => setTimeout(r, t));

export default class App extends Component {
	async componentDidMount() {
		await delay(200);
		this.setState({
			render: true,
		});
	}

	render(props, { render = false }) {
		return (
			<div>
				<h1>Example</h1>
				<div>{render ? 'after delay' : 'before delay'}</div>
			</div>
		);
	}
}
