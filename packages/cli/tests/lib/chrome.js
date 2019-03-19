const puppeteer = require('puppeteer');
const { log, waitUntil } = require('./utils');

module.exports = async function() {
	return await puppeteer.launch();
};

module.exports.waitUntilExpression = async function(page, expression) {
	let evaluate = async () => {
		let { result } = await log(
			() => page.evaluate(expression),
			`Waiting for ${expression}`
		);

		return result; // && result.value;
	};

	await waitUntil(evaluate, `Waiting for ${expression} timed out!`);
};

module.exports.loadPage = async function(chrome, url) {
	let page = await chrome.newPage();
	await log(() => page.goto(url), `Navigating to ${url}`);
	return page;
};
