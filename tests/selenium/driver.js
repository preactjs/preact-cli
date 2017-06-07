import { Builder, Capabilities } from 'selenium-webdriver';
import phantomjs from 'phantomjs-prebuilt';

const phantomJSCapabilities = Capabilities.phantomjs();
phantomJSCapabilities.set("phantomjs.binary.path", phantomjs.path);
phantomJSCapabilities.set("phantomjs.cli.args", ['--ignore-ssl-errors=true']);

export default async () => await new Builder().withCapabilities(phantomJSCapabilities).build();
