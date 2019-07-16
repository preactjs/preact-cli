import { h } from 'preact';
import { Provider } from '../../pre-render-data';

const interopDefault = m => (m && m.default ? m.default : m);

export default ({ CLI_DATA: { preRenderData } = {}, ...props }) => {
	let app = interopDefault(require('preact-cli-entrypoint'));
	return <Provider value={preRenderData}>{h(app, props)}</Provider>;
};
