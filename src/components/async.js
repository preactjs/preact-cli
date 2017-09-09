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
			console.log('> child: ', child());
			this.setState({ child, ready:!!child });
		};
		let r = load(done);
		if (r && r.then) r.then(done);
	}
	Async.prototype = new Component;
	Async.prototype.constructor = Async;
	Async.prototype.componentDidUpdate = function (_, state) {
		if (!state.ready && this.state.ready) {
			console.log('LOADED FOR FIRST TIME');
			emit('async-loaded');
		}
	};
	Async.prototype.render = (props, state) => state.child && h(state.child, props);
	return Async;
}
