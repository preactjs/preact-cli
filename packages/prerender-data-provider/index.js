import { Component } from 'preact';
import { createContext } from 'preact-compat';

const { Provider, Consumer } = createContext(null);

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
						let preRenderDataToBePassed = {};
						if (
							value &&
							value.CLI_DATA &&
							value.CLI_DATA.preRenderData &&
							value.CLI_DATA.preRenderData.url &&
							props.url === value.CLI_DATA.preRenderData.url
						) {
							preRenderDataToBePassed = value.CLI_DATA.preRenderData;
						}
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

// TODO: implement a hook when we move to PreactX.

export { Provider, withPrerenderData };
