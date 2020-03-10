exports.TEMPLATES_REPO_URL =
	'https://api.github.com/users/preactjs-templates/repos';

exports.CUSTOM_TEMPLATE = {
	value: 'custom',
	title: 'Custom',
	description: 'Use your own template',
};

exports.FALLBACK_TEMPLATE_OPTIONS = [
	{
		value: 'preactjs-templates/default',
		title: 'default',
		description: 'The default template for Preact CLI',
	},
	{
		value: 'preactjs-templates/typescript',
		title: 'typescript',
		description: 'The default template for Preact CLI in typescript',
	},
	{
		value: 'preactjs-templates/material',
		title: 'material',
		description: 'The material design `preact-cli` template',
	},
	{
		value: 'preactjs-templates/simple',
		title: 'simple',
		description: 'A simple, minimal "Hello World" template for Preact CLI',
	},
	{
		value: 'preactjs-templates/netlify',
		title: 'netlify',
		description: 'A preactjs and netlify CMS template',
	},
	{
		value: 'preactjs-templates/widget',
		title: 'widget',
		description: 'Template for a widget to be embedded in another website',
	},
];

exports.TEMPLATES_CACHE_FOLDER = '.cache';
exports.TEMPLATES_CACHE_FILENAME = 'preact-templates.json';
