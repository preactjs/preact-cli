'use strict';

exports.__esModule = true;

exports.default = function (req) {
	function Async() {
		_preact.Component.call(this);

		let b, old;
		this.componentWillMount = () => {
			b = this.base = this.nextBase || this.__b;
			req(m => {
				this.setState({ child: m.default || m });
			});
		};

		this.shouldComponentUpdate = (_, nxt) => {
			nxt = nxt.child === void 0;
			if (nxt && old === void 0 && !!b) {
				old = (0, _preact.h)(b.nodeName, { dangerouslySetInnerHTML: { __html: b.innerHTML } });
			} else {
				old = '';
			}
			return !nxt;
		};

		this.render = (p, s) => s.child ? (0, _preact.h)(s.child, p) : old;
	}
	(Async.prototype = new _preact.Component()).constructor = Async;
	Async.prefetch = req;
	return Async;
};

var _preact = require('preact');