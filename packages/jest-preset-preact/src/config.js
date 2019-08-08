const preact = require('preact');
const { resolve } = require('path');

const isVersion10 = preact.Fragment !== undefined;
const compat = isVersion10 ? 'preact/compat' : 'preact-compat';

const mappedModules = {
	'^react-dom$': compat,
	'^react$': compat,
	'^.+\\.(css|sass|scss|less)$': 'identity-obj-proxy',
};

if (isVersion10) {
	mappedModules['^react-dom/test-utils$'] = 'preact/test-utils';
}

module.exports = {
	setupFiles: [resolve(__dirname, 'jsdom-polyfills.js')],
	collectCoverageFrom: ['src/**/*.{mjs,js,jsx,ts,tsx}', '!src/**/*.d.ts'],
	testMatch: [
		'<rootDir>/src/**/__tests__/**/*.{mjs,js,jsx,ts,tsx}',
		'<rootDir>/{src,test,tests}/**/*.{spec,test}.{mjs,js,jsx,ts,tsx}',
	],
	// Jest still supports node v6 and therefore won't update jsdom past v11
	testEnvironment: 'jest-environment-jsdom-fourteen',
	transform: {
		'^.+\\.(mjs|js|jsx|ts|tsx)$': resolve(__dirname, 'babel-jest.js'),
	},
	transformIgnorePatterns: [
		'[/\\\\]node_modules[/\\\\].+\\.(mjs|js|jsx|ts|tsx)$',
		'^.+\\.(css|sass|scss|less)$',
	],
	moduleNameMapper: mappedModules,
};
