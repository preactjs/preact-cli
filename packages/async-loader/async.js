import { Component, options, h } from 'preact';

const PENDING = {};

export default function async(load) {
	let dom;
	let old = options.vnode;

	// get access to the current DOM node from vnode.
	options._diff = (vnode) => {
		if (!component && vnode._children) {
			let prev;
			for (let i = 0; i < vnode._children.length; i++) {
				let c = vnode._children[i];
				if (c) {
					prev = c._dom || c.__e || prev;

					if (c.type === AsyncComponent) {
						dom = prev.nextSibling;
					}
				}
			}
		}
		if (old) old(vnode);
	};

	let component;
	function AsyncComponent() {
		Component.call(this);

		if (!component) {
			this.componentWillMount = () => {
				load((mod) => {
					component = (mod && mod.default) || mod;
					this.setState({});
				});
			};

			this.shouldComponentUpdate = () => component != null;
		}

		this.render = (props) => {
			if (component) {
				return h(component, props);
			}

			const me = dom;

			return (
				me &&
				h(me.localName, {
					dangerouslySetInnerHTML: PENDING,
				})
			);
		};
	}

	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;

	return AsyncComponent;
}
