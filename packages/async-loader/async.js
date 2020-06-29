import { h, Component } from 'preact';

const PENDING = {};

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

			const me = (this.__P || this._parentDom).lastChild;

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
