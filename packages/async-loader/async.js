// import { options, h, Component } from 'preact';
import { h, Component, options, render } from 'preact';

const DOM = '__e';
const CHILDREN = '__k';
const PARENT = '__';
const UNMOUNT = 'unmount';
const oldUnmountOpts = options[UNMOUNT];
const oldDiffed = options.diffed;
const IS_PRERENDERED = document.querySelector('#app');

let hydrationNode = null;
let IS_HYDRATING = false;

if (IS_PRERENDERED) {
	hydrationNode = document.querySelector('#app').lastChild;
	IS_HYDRATING = true;

	options[UNMOUNT] = function(vnode) {
		/**
		 *  3. now Pending is being unmount and its dom is being removed
		 *  so we detach the dom from the vnode and empty its children so that Pending is unmount
		 *  but the DOM is never actually removed.
		 */
		if (vnode.type === Pending) {
			vnode[DOM] = null;
			vnode[CHILDREN] = [];
			// this hook in options is no more needed once hydration is done.
			options[UNMOUNT] = oldUnmountOpts;
		}
		oldUnmountOpts && oldUnmountOpts(vnode);
	};

	options.diffed = function(vnode) {
		/**
		 *  4. The route component is now contructed and its DOM will be appended to the browser's DOM.
		 *  But right before it, we swap its newly contructed DOM with the DOM already present on the browser.
		 */
		if (
			vnode[DOM] &&
			vnode[DOM].parentNode === null &&
			vnode[PARENT] &&
			vnode[PARENT][PARENT] &&
			vnode[PARENT][PARENT].type.name === 'AsyncComponent'
		) {
			vnode[DOM] = document.querySelector('#app').lastChild;
			// this hook in options is no more needed once hydration is done.
			options.diffed = oldDiffed;
		}
		oldDiffed && oldDiffed(vnode);
	};
}

function Pending() {
	// 1. this fake component makes sure that the route markup is not removed on hydration.
	return h(hydrationNode.localName, {
		dangerouslySetInnerHTML: {
			__html: hydrationNode ? hydrationNode.outerHTML : '',
		},
	});
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
			if (component && IS_HYDRATING) {
				// switch to non hydrating mode for further routes
				IS_HYDRATING = false;
				hydrationNode = null;
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
