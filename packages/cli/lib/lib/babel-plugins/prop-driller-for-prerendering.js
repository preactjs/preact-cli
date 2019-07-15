const { warn } = require('../../util');

/**
 * Passes all the props from <App> to every <Component> having path attribute.
 * This enables automatic prop drilling at the time of pre-rendering so that
 * components can use them to generate html pages at the time of prerendering.
 */
module.exports = function({ types: t }) {
	let routerFound = false;
	return {
		visitor: {
			ImportDeclaration(path) {
				const { node } = path;
				const { specifiers, source } = node;
				if (source.value !== 'preact-router' || specifiers.length < 1) {
					return;
				}
				const { local } = specifiers[0];
				if (local && local.name === 'Router') {
					routerFound = true;
				}
			},
			JSXOpeningElement(path) {
				const { node } = path;
				if (!routerFound) {
					return;
				}
				// Checks if this is a child of <Router> component
				const routerNode = path.findParent(
					path =>
						path.isJSXElement() &&
						path.node.openingElement &&
						path.node.openingElement.name &&
						path.node.openingElement.name.name === 'Router'
				);
				const propDriller = t.JSXSpreadAttribute(t.identifier('props'));
				const hasPathAttribute = node.attributes.some(attr => {
					return attr.name && attr.name.name === 'path';
				});
				const optOutDrillingProps = node.attributes.some(attr => {
					return attr.name && attr.name.name === 'no-drill';
				});
				const alreadySpreads = node.attributes.some(attr => {
					return (
						attr.type === 'JSXSpreadAttribute' && attr.argument.name === 'props'
					);
				});
				const isMatchingNode =
					hasPathAttribute && !optOutDrillingProps && !alreadySpreads;
				if (routerNode && isMatchingNode) {
					node.attributes.push(propDriller);
				} else if (!routerNode && isMatchingNode) {
					warn('No router found! Will not be able to drill props to routes');
				}
			},
		},
	};
};
