const data = [
	{
		url: '/',
		title: 'Home',
	},
	{
		url: '/route66',
		title: 'Route66',
	},
	{
		url: '/custom',
		title: 'Custom',
		myProp: 'It worked!',
	},
];

module.exports = () => new Promise(resolve => resolve(data));
