// import { options, h, Component } from 'preact';
import { h, Component, options, render } from 'preact';

const f = 'unmount';
const oldUnmountOpts = options[f];
const oldDiffed = options.diffed;

options[f] = function(vnode) {
	/**
	 *  3. now Pending is being unmount and its dom is being removed
	 *  so we detach the dom from the vnode and empty its children so that Pending is unmount
	 *  but the DOM is never actually removed.
	 */
	if (vnode.type === Pending) {
		vnode.__e = null;
		vnode.__k = [];
	}
	oldUnmountOpts && oldUnmountOpts(vnode);
};

options.diffed = function(vnode) {
	/**
	 *  4. The route component is now contructed and its DOM will be appended to the browser's DOM.
	 *  But right before it, we swap its newly contructed DOM with the DOM already present on the browser.
	 */
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
	// 1. this fake component makes sure that the route markup is not removed on hydration.
	return (
		<div
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
					// 2. this mounts the actual route component.
					this.setState({});
				});
			};
			this.shouldComponentUpdate = () => component != null;
		}
		this.render = props => {
			const vnode = h(component || Pending, props);
			if (component) {
				// hydrating this vnode with the DOM already present on screen.
				render(
					vnode,
					document.querySelector('#app'),
					document.querySelector('#app').lastChild
				);
				return;
			}
			return vnode;
		};
	}
	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;
	return AsyncComponent;
}
