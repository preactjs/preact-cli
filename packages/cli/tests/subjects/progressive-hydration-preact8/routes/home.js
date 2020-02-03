export default ({ url }) => (
	<div>
		Home {url}{' '}
		<button
			onClick={() => {
				window.CHANGED_VAR = 1;
			}}
		>
			Change Val
		</button>
	</div>
);
