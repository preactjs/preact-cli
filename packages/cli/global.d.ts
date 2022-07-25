declare const __webpack_public_path__: string;

declare namespace jest {
	interface Matchers<R> {
		toBeCloseInSize(receivedSize: number, expectedSize: number): R;
		toFindMatchingKey(receivedKey: string): R;
	}
}

declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}
declare module '*.module.sass' {
	const classes: { [key: string]: string };
	export default classes;
}
declare module '*.module.scss' {
	const classes: { [key: string]: string };
	export default classes;
}
