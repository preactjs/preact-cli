import './custom.css';
import { withPrerenderData } from '../../../../pre-render-data';
const component = ({ cliData = {} }) => <div>{cliData.myProp}</div>;
export default withPrerenderData(component);
