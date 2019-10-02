import { Component, createContext } from 'preact';
import { useContext } from 'preact/hooks';

const PrerenderDataContext = createContext(null);
const { Provider, Consumer } = PrerenderDataContext;

function getPrerenderdata(value, props) {
	if (
		value &&
		value.CLI_DATA &&
		value.CLI_DATA.preRenderData &&
		value.CLI_DATA.preRenderData.url &&
		props.url === value.CLI_DATA.preRenderData.url
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

function usePrerenderData(url) {
	const value = useContext(PrerenderDataContext);
	return getPrerenderdata(value, { url }) || {};
}

export { Provider, withPrerenderData, usePrerenderData };
