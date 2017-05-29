import { h, Component } from 'preact';

export default function(load) {
	function Async() {
		Component.call(this);
		let done = child => {
			this.setState({ child: child && child.default || child });
		};
		let r = load(done);
		if (r && r.then) r.then(done);
	}
	Async.prototype = new Component;
	Async.prototype.constructor = Async;
	Async.prototype.render = (props, state) => h(state.child, props);
	return Async;
}
