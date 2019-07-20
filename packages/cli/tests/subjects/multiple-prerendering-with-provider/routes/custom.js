import './custom.css';
import { withPrerenderData } from '@preact/prerender-data-provider';
const Custom = ({ CLI_PRERENDER_DATA: { myProp } }) => <div>{myProp}</div>;
export default withPrerenderData(Custom);
