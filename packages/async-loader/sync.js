import { h } from 'preact';

export default function sync(load) {
	var component;
	return function SyncComponent(props) {
		if (!component) {
			load(mod => {
				component = (mod && mod.default) || mod;
			});
		}
		var modifiedComponent = () => {
			var c = component(props);
			if (!c) {
				return;
			}
			if ('props' in c) {
				c.props = c.props || {};
				c.props['data-pacr'] = '';
			} else if ('attributes' in c) {
				c.attributes = c.attributes || {};
				c.attributes['data-pacr'] = '';
			}
			return c;
		};
		return h(modifiedComponent, props);
	};
}
