import { h, Component } from 'preact';

const PENDING = {};

// Given a VNode, finds its previous element sibling.
function getPreviousSibling(vnode) {
	const parent = vnode.__;
	if (!parent) return;
	let children = parent.__k;
	if (children) {
		if (!Array.isArray(children)) children = [children];
		// only search previous children
		let end = children.indexOf(vnode);
		if (end === -1) end = children.length;
		for (let i=end; i--; ) {
			const child = children[i];
			const dom = child && child.__e || getPreviousSibling(child);
			if (dom) return dom;
		}
	}
	return getPreviousSibling(parent);
}

export default function async(load) {
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

			const prev = getPreviousSibling(this.__v);
			const me = prev && prev.nextSibling || (this.__P || this._parentDom).firstChild;

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
