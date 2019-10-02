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
	{
		url: '/customhook',
		title: 'CustomHook',
		myProp: 'It worked with hook!',
	},
];

module.exports = () => data;
