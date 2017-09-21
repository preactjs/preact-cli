exports.home = `
<body>
	<div id="app">
		<header class="header__3QGkI">
			<h1>Preact App</h1>
			<nav>
				<a href="/" class="active__3gItZ">Home</a>
				<a href="/profile" class="">Me</a>
				<a href="/profile/john" class="">John</a>
			</nav>
		</header>
		<div class="home__MseGd">
			<h1>Home</h1>
			<p>This is the Home component.</p>
		</div>
	</div>
	{{ ... }}
</body>
`;

exports.profile = `
<body>
	<div id="app">
		<header class="header__3QGkI">
			<h1>Preact App</h1>
			<nav>
				<a href="/" class="">Home</a>
				<a href="/profile" class="active__3gItZ">Me</a>
				<a href="/profile/john" class="">John</a>
			</nav>
		</header>
		<div class="profile__t2Dqz">
			<h1>Profile: me</h1>
			<p>This is the user profile for a user named me.</p>
			<div>{{ ... }}</div>
			<p><button>Click Me</button> Clicked 10 times.</p>
		</div>
	</div>
	{{ ... }}
</body>
`;
