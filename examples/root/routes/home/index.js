import { h, Component } from 'preact';
import style from './style';
import Button from 'preact-material-components/Button';
import 'preact-material-components/Button/style.css';
export default class Home extends Component {
	render() {
		return (
			<div class={style.home}>
				<h1>Home</h1>
				<Button ripple={true} primary={true} raised={true} > Hello material</Button>
				<p>This is the Home component.</p>
			</div>
		);
	}
}
