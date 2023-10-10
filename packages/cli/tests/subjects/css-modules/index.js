import './style.css';
import styles from './style.module.css';

export default () => {
	return (
		<div>
			<h1>This is an app with some fancy styles!</h1>
			<h2 class={styles.text}>We can even use CSS Modules!</h2>
		</div>
	);
};
