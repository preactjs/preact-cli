import { h, Component } from 'preact';

export default class Base extends Component {
	state = {
		state: 'initialized',
	};

	render() {
		return <div>Base</div>;
	}
}
