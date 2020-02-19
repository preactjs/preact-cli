import { h } from 'preact';

var component;
export default function sync(load) {
	return function SyncComponent(props) {
		if (!component) {
			load(mod => {
				component = (mod && mod.default) || mod;
			});
		}
		var modifiedComponent = () => {
			var c = component();
			if ('props' in c) {
				c.props['data-pacr'] = '';
			} else if ('attributes' in c) {
				c.attributes['data-pacr'] = '';
			}
			return c;
		};
		return h(modifiedComponent, props);
	};
}
