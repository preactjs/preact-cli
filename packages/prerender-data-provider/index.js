import { Component, createContext } from 'preact';
import { useState, useContext } from 'preact/hooks';

const PrerenderDataContext = createContext(null);
const { Provider, Consumer } = PrerenderDataContext;

function normalizeUrl(url) {
	return url.endsWith('/') ? url : url + '/';
}

function getPrerenderdata(value, props) {
	if (
		value &&
		value.CLI_DATA &&
		value.CLI_DATA.preRenderData &&
		value.CLI_DATA.preRenderData.url &&
		normalizeUrl(props.url) === value.CLI_DATA.preRenderData.url
	) {
		return value.CLI_DATA.preRenderData;
	}
}

const withPrerenderData = WrapperComponent => {
	return class extends Component {
		render(props) {
			if (!('url' in props)) {
				throw new Error(
					'The withPrerenderData HOC expects current URL in props. This is required to give the pre-render data to the correct instance only.'
				);
			}
			return (
				<Consumer>
					{value => {
						const preRenderDataToBePassed =
							getPrerenderdata(value, props) || {};
						const allProps = {
							CLI_PRERENDER_DATA: { ...preRenderDataToBePassed },
							...props,
						};
						return <WrapperComponent {...allProps} />;
					}}
				</Consumer>
			);
		}
	};
};

function usePrerenderData(props) {
	const value = useContext(PrerenderDataContext);
	const [preRenderData, setPreRenderData] = useState(value);
	function fetchPreRenderData(url) {
		fetch(`${normalizeUrl(url)}preact_prerender_data.json`)
			.then(data => data.json())
			.then(data => {
				setPreRenderData(data);
			});
	}
	return [getPrerenderdata(preRenderData, props) || {}, fetchPreRenderData];
}

export { Provider, withPrerenderData, usePrerenderData };
