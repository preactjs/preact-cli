import { h, Component, options } from 'preact';

const DOM = '__e';
const CHILDREN = '__k';
const UNMOUNT = 'unmount';
const oldUnmountOpts = options[UNMOUNT];
const oldDiffed = options.diffed;
const AsyncComponentName = async().name;

let hydrationNode = null;
let IS_HYDRATING = false;

const IS_PRERENDERED = !!document.querySelector('[data-pacr]');

if (IS_PRERENDERED) {
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
		const PARENT = '__p' in vnode ? '__p' : '__';
		/**
		 *  4. The route component is now contructed and its DOM will be appended to the browser's DOM.
		 *  But right before it, we swap its newly contructed DOM with the DOM already present on the browser.
		 *  TLDR; This prevent a duplicate DOM entry
		 */
		if (
			vnode[DOM] &&
			vnode[DOM].parentNode === null &&
			vnode[PARENT] &&
			vnode[PARENT][PARENT] &&
			vnode[PARENT][PARENT].type.name === AsyncComponentName
		) {
			/**
			 * Old markup is now being removed and preact will replace it with fresh DOM.
			 * THIS IS FAKE HYDRATION. THE OLD DOM IS RIPPED AND NEW ONE IS CONSTRUCTED.
			 * THIS SHOULD BE FIXED IN PREACT CORE.
			 */
			hydrationNode.parentNode.removeChild(hydrationNode);
			// this hook in options is no more needed once hydration is done.
			options.diffed = oldDiffed;
		}
		oldDiffed && oldDiffed(vnode);
	};
}

function Pending() {
	hydrationNode = document.querySelector('[data-pacr]');
	const isInPlaceHydration = hydrationNode && IS_HYDRATING;
	// 1. this fake component makes sure that the route markup is not removed on hydration.
	return isInPlaceHydration
		? h(hydrationNode.localName, {
				dangerouslySetInnerHTML: {
					__html: hydrationNode.innerHTML,
				},
		  })
		: h('div');
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
			}
			return vnode;
		};
	}
	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;
	return AsyncComponent;
}
