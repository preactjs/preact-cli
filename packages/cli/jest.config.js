/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
	// All imported modules in your tests should be mocked automatically
	automock: false,

	// Stop running tests after `n` failures
	bail: 0,

	// Automatically clear mock calls and instances between every test
	clearMocks: true,

	// An array of regexp pattern strings, matched against all module paths before considered 'visible' to the module loader
	modulePathIgnorePatterns: [
		'<rootDir>/tests/output',
		'<rootDir>/tests/subjects',
	],

	// A list of paths to modules that run some code to configure or set up the testing framework before each test
	setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

	// An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
	testPathIgnorePatterns: [
		'\\\\node_modules\\\\',
		'<rootDir>/tests/output',
		'<rootDir>/tests/subjects',
	],

	// This option allows use of a custom test runner
	// testRunner: "jest-circus/runner",

	// TODO: Restored in #1667, remove when upgrading Jest
	testEnvironment: 'node',
};
