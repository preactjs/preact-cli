import { h } from 'preact';
import style from './style.scss';

const App = () => (
	<div className={style.background}>
		<h1>Header on background</h1>
		<p>Paragraph on background</p>
	</div>
);

export default App;
