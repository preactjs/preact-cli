import { h, Component } from 'preact';

function emit(name) {
	window.dispatchEvent( new Event(name) );
}

export default function (load) {
	function Async() {
		Component.call(this);
		emit('async-loading');
		let done = child => {
			child = child && child.default;
			this.setState({ child, ready:!!child });
		};
		let r = load(done);
		if (r && r.then) r.then(done);
	}
	Async.prototype = new Component;
	Async.prototype.constructor = Async;
	Async.prototype.componentDidUpdate = function (_, state) {
		this.state.ready && !state.ready && emit('async-loaded');
	};
	Async.prototype.render = (props, state) => state.child && h(state.child, props);
	return Async;
}
