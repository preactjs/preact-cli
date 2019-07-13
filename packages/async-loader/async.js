import { h, Component } from 'preact';

export default function(req) {
	function Async() {
		Component.call(this);

		let b, old;
		this.componentWillMount = () => {
			b = this.base = this.nextBase || this.__b; // short circuits 1st render
			const inlineDataElement = document.querySelector(
				'[type="__PREACT_CLI_DATA__"]'
			);
			const urlData = inlineDataElement
				? JSON.parse(inlineDataElement.innerHTML)
				: {};
			req(m => {
				this.setState({
					child: m.default || m,
					urlData,
				});
			});
		};

		this.shouldComponentUpdate = (_, nxt) => {
			nxt = nxt.child === void 0;
			if (nxt && old === void 0 && b) {
				// Node.TEXT_NODE
				if (b.nodeType === 3) {
					old = b.data;
				} else {
					old = h(b.nodeName, {
						dangerouslySetInnerHTML: { __html: b.innerHTML },
					});
				}
			} else {
				old = ''; // dump it
			}
			return !nxt;
		};

		this.render = (p, s) => {
			if (!s.urlData || s.urlData.url !== window.location.pathname) {
				return s.child ? h(s.child, p) : old;
			}

			return s.child ? h(s.child, { ...s.urlData, ...p }) : old;
		};
	}
	(Async.prototype = new Component()).constructor = Async;
	return Async;
}
