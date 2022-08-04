import { Component } from 'preact';

export default class App extends Component {
	render() {
		return (
			<div rendered-on={typeof window == 'undefined' ? 'server' : 'client'}>
				hi
			</div>
		);
	}
}
