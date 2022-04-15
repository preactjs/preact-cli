import { h } from 'preact';
import Component from './components';
import Route from './routes';
import './global.css';

export default () => {
	return (
		<div>
			<h1>This is an app with some fancy styles!</h1>
			<Route />
			<Component />
		</div>
	);
};
