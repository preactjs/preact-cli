export const Result = ({ result }) => (
	<div class="result">
		<div>
			<a href={result.html_url} target="_blank">
				{result.full_name}
			</a>
			🌟<strong>{result.stargazers_count}</strong>
		</div>
		<p>{result.description}</p>
	</div>
);
