import './style';
import { Component } from 'preact';
import { Result } from './result';

const SEARCH = '//api.github.com/search/repositories';

export default class App extends Component {
	componentDidMount() {
		fetch(`${SEARCH}?q=preact`)
			.then( r => r.json() )
			.then( json => {
				this.setState({
					results: json && json.items || []
				});
			});
	}

	render(props, { results=[] }) {
		return (
			<div>
				<h1>Example</h1>
				<div class="list">
					{ results.map( result => (
						<Result result={result} />
					)) }
				</div>
			</div>
		);
	}
}
