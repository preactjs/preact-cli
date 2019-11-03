// import { options, h, Component } from 'preact';
import { h, Component } from 'preact';

const PENDING = {};

// const e = '_catchError' in options ? '_catchError' : '__e';
// let old = options[e];
// options[e] = function (error, vnode, oldVNode) {
// 	if (error === PENDING) {
// 		console.log('CAUGHT ERROR', vnode.__e === oldVNode.__e);
// 		const key = '_dom' in vnode ? '_dom' : '__e';
// 		vnode[key] = oldVNode[key];
// 		return;
// 	}

// 	old(error, vnode, oldVNode);
// };

// function Pending() {
// 	console.log("throwing pending render");
// 	throw PENDING;
// }

export default function async(load) {
	let component;
	function AsyncComponent() {
		Component.call(this);
		if (!component) {
			this.componentWillMount = () => {
				// console.log("loading component"),
				load(mod => {
					// console.log("loaded component");
					component = (mod && mod.default) || mod;
					// this.componentDidCatch = null;
					// this._vnode;
					this.setState({});
					// this.hydrate();
				});
			};
			// this.componentDidCatch = err => {
			// 	console.log("caught pending render", err === PENDING, this);
			// 	if (err !== PENDING) throw err;
			// };
			this.shouldComponentUpdate = () => component != null;
		}
		// this.render = props => h(component || Pending, props);
		this.render = props => {
			if (component) return h(component, props);

			const me = (this.__P || this._parentDom).lastChild;
			return (
				me &&
				h(me.localName, {
					dangerouslySetInnerHTML: PENDING,
				})
			);

			// const me = this.__P && this.__P.lastChild;
			// console.log(me + '', me && me.innerHTML);
			// const vnode = h(me.localName, {
			// 	dangerouslySetInnerHTML: PENDING
			// });
			// // if ('_dom' in vnode) vnode._dom = this.base;
			// // else vnode.__e = this.base;
			// return vnode;
		};
	}
	AsyncComponent.preload = load;
	(AsyncComponent.prototype = new Component()).constructor = AsyncComponent;
	return AsyncComponent;
}
