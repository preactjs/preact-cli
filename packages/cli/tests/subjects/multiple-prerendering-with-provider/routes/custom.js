import './custom.css';
import { PreRenderDataSource } from '@preact/prerender-data-provider';
const Custom = props => (
	<PreRenderDataSource {...props} render={({ value }) => <div>{value}</div>} />
);
export default Custom;
