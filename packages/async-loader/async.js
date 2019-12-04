// import { options, h, Component } from 'preact';
import { h, Component, options, hydrate } from 'preact';

const f = 'unmount';
const oldUnmountOpts = options[f];
const oldDiffed = options.diffed;

options[f] = function(vnode) {
	if (vnode.type === Pending) {
		vnode.__e = null;
		vnode.__k = [];
	}
	oldUnmountOpts && oldUnmountOpts(vnode);
};

options.diffed = function(vnode) {
	if (
		vnode.__e &&
		vnode.__e.parentNode === null &&
		vnode.__.__ &&
		vnode.__.__.type.name === 'AsyncComponent'
	) {
		vnode.__e = document.querySelector('#app').lastChild;
	}
	oldDiffed && oldDiffed(vnode);
};

function Pending() {
	const __html = document.querySelector('#app').lastChild.outerHTML;
	return (
		<section
			dangerouslySetInnerHTML={{
				__html,
			}}
		/>
	);
}

export default function async(load) {
	let component;
	function AsyncComponent() {
		Component.call(this);
		if (!component) {
			this.componentWillMount = () => {
				load(mod => {
					component = (mod && mod.default) || mod;
					this.setState({});
				});
			};
			this.shouldComponentUpdate = () => component != null;
		}
		this.render = props => {
			const vnode = h(component || Pending, props);
			if (component) {
				hydrate(vnode, document.querySelector('#app'));
				return;
			}
			return vnode;
		};
	}
	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;
	return AsyncComponent;
}
