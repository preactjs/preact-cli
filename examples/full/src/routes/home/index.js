import { h, Component } from 'preact';
import style from './style';

// eslint-disable-next-line
export default class Home extends Component {
	render() {
		return (
			<div class={style.home}>
				<h1>Home</h1>
				<p>This is the Home component.</p>
			</div>
		);
	}
}
