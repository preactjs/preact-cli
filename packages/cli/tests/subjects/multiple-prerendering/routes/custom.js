import './custom.css';
import { withPrerenderData } from '../../../../lib/pre-render-data-context';
const component = ({ cliData = {} }) => <div>{cliData.myProp}</div>;
export default withPrerenderData(component);
