import './style.sass';
import './style.scss';
import sassStyles from './style.module.sass';
import scssStyles from './style.module.scss';

export default () => {
	return (
		<div>
			<h1>This is an app with some fancy styles!</h1>
			<h2 class={`${sassStyles.text} ${scssStyles.text}`}>
				We can even use CSS Modules!
			</h2>
		</div>
	);
};
