import './custom.css';
import { usePrerenderData } from '@preact/prerender-data-provider';
const Custom = props => {
	const [value] = usePrerenderData(props);
	return <div>{(value || {}).myProp}</div>;
};
export default Custom;
