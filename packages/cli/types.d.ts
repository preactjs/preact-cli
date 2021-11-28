import webpack from 'webpack';

type Rule = {
	test: RegExp;
	[key: string]: any;
};

type RuleWrapper = {
	index: number;
	rule: Rule;
};

type Loader = {
	loader: string;
	options: Record<string, any>;
};

type LoaderWrapper = {
	rule: Rule;
	ruleIndex: number;
};

type Plugin = Record<string, any>;

type PluginWrapper = {
	index: number;
	plugin: Plugin;
};

/**
 * Basic structure of config
 */
export type Config = {
	resolve: {
		modules: string[];
		extensions: string[];
		alias: string[];
	};
	module: {
		rules: Rule[];
	};
	plugins: Plugin[];
	mode: 'production' | 'development';
	devtool: string | boolean;
	output: {
		filename: string;
		chunkFilename: string;
		publicPath: string;
		[key: string]: any;
	};
	devServer?: Record<string, any>;
	[key: string]: any;
};

/**
 * Non-exhaustive list of environment conditions you may want
 * to check for in your config
 */
export type Env = {
	src: string;
	dest: string;
	esm: boolean;
	sw: boolean;
	dev: boolean;
	production: boolean;
	isProd: boolean;
	ssr: boolean;
	prerender: boolean;
	[key: string]: any;
};

export type Helpers = {
	/**
	 * Returns Webpack module used to create config
	 */
	webpack: typeof webpack;

	/**
	 * Returns wrapper around all loaders from config
	 */
	getLoaders(
		config: Config
	): (LoaderWrapper & { loaders: string | (string | Loader)[] })[];

	/**
	 * Returns wrapper around all loaders that match provided name
	 *
	 * @example helpers.getLoadersByName(config, 'babel-loader');
	 */
	getLoadersByName(
		config: Config,
		name: string
	): (LoaderWrapper & { loader: string | Loader; loaderIndex: number })[];

	/**
	 * Returns wrapper around all rules from config
	 */
	getRules(config: Config): RuleWrapper[];

	/**
	 * Returns wrapper around all rules that match provided file
	 *
	 * File is resolve relative to $PWD
	 *
	 * @example helpers.getRulesByMatchingFile(config, 'src/index.js');
	 */
	getRulesByMatchingFile(config: Config, file: string): RuleWrapper[];

	/**
	 * Returns wrapper around all plugins from config
	 */
	getPlugins(config: Config): PluginWrapper[];

	/**
	 * Returns wrapper around all plugins that match provided name
	 *
	 * @example helpers.getPluginsByName(config, 'Critters');
	 */
	getPluginsByName(config: Config, name: string): PluginWrapper[];

	/**
	 * Returns wrapper around all plugins that match provided type
	 *
	 * @example helpers.getPluginsByType(config, webpack.DefinePlugin);
	 */
	getPluginsByType(config: Config, type: any): PluginWrapper[];
};
