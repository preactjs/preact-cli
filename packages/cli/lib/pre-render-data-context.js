import { Component } from 'preact';
import { createContext } from 'preact-compat';

const { Provider, Consumer } = createContext(null);

const withPrerenderData = WrapperComponent => {
	return class extends Component {
		render(props) {
			return (
				<Consumer>
					{value => {
						if (props.url === value.url) {
							const allProps = { cliData: { ...value }, ...props };
							return <WrapperComponent {...allProps} />;
						}
						return <WrapperComponent {...props} />;
					}}
				</Consumer>
			);
		}
	};
};

// TODO: implement a hook when we move to PreactX.

export { Provider, withPrerenderData };
