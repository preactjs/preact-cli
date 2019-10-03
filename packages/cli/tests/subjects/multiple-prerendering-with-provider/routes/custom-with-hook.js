import './custom.css';
import { usePrerenderData } from '@preact/prerender-data-provider';
const Custom = props => {
	const { myProp } = usePrerenderData(props);
	return <div>{myProp}</div>;
};
export default Custom;
