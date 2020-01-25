import { h, Component } from 'preact';

const PENDING = {};

function Pending() {
	throw PENDING;
}

export default function async(load) {
	let component;
	function AsyncComponent() {
		Component.call(this);
		if (!component) {
			(this.componentWillMount = () => {
				load(mod => {
					component = (mod && mod.default) || mod;
					this.componentDidCatch = null;
					this.setState({});
				});
			}),
				(this.componentDidCatch = err => {
					if (err !== PENDING) throw err;
				});
			this.shouldComponentUpdate = () => component != null;
		}
		this.render = props => h(component || Pending, props);
	}
	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;
	return AsyncComponent;
}
