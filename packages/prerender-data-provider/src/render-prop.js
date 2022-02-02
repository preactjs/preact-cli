import { Component } from 'preact';
import { PrerenderDataContext } from './context';
import { getPrerenderdata, checkProps, normalizeUrl } from './utils';
import { PRERENDER_DATA_FILE_NAME } from './constants';

const { Consumer } = PrerenderDataContext;

class PreRenderDataSource extends Component {
	state = {
		value: null,
		isLoading: false,
		error: false,
	};
	componentDidMount() {
		checkProps(this.props);
	}

	fetchPrerenderData = async () => {
		this.setState({
			value: null,
			isLoading: true,
			error: false,
		});
		try {
			const response = await fetch(
				`${normalizeUrl(this.props.url)}${PRERENDER_DATA_FILE_NAME}`
			);
			const json = await response.json();
			this.setState({
				value: json,
				isLoading: false,
				error: false,
			});
		} catch (e) {
			this.setState({
				value: null,
				isLoading: false,
				error: e,
			});
		}
	};

	render(props, { value, isLoading, error }) {
		if (!('doAutomaticFetch' in props)) {
			props.doAutomaticFetch = true;
		}
		return (
			<Consumer>
				{contextValue => {
					let obtainedContextValue;
					// If the data is in script tag, it will be accesible from the following chaining
					if (contextValue) {
						obtainedContextValue = contextValue;
					}
					const preRenderDataToBePassed = getPrerenderdata(
						value || obtainedContextValue,
						props
					);
					// if the data is not in script tag, we'll fetch it from the server
					if (
						props.doAutomaticFetch &&
						preRenderDataToBePassed === null &&
						!isLoading &&
						!error
					) {
						this.fetchPrerenderData();
					}

					return props.render({
						value: preRenderDataToBePassed,
						isLoading,
						error,
					});
				}}
			</Consumer>
		);
	}
}

export { PreRenderDataSource };
