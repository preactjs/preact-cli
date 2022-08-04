import { Component } from 'preact';
import './custom.css';
import { PreRenderDataSource } from '@preact/prerender-data-provider';
class Custom extends Component {
	render(props) {
		return (
			<PreRenderDataSource
				{...props}
				render={({ value }) => {
					return <div>{(value || {}).myProp}</div>;
				}}
			/>
		);
	}
}

export default Custom;
