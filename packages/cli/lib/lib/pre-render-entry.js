import { h } from 'preact';
import { Provider } from '../pre-render-data-context';

const interopDefault = m => (m && m.default ? m.default : m);

export default props => {
	let app = interopDefault(require('preact-cli-entrypoint'));
	const cliData = props['CLI_DATA'] || {};
	return <Provider value={cliData.preRenderData}>{h(app)}</Provider>;
};
