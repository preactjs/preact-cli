import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

export default class Header extends Component {
	render() {
		return (
			<header class={style.header}>
				<h1>Preact App</h1>
				<nav>
					<Link activeClassName="active" href="/">Home</Link>
					<Link activeClassName="active" href="/profile">Me</Link>
					<Link activeClassName="active" href="/profile/john">John</Link>
				</nav>
			</header>
		);
	}
}
