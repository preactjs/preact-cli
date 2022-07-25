declare const __webpack_public_path__: string;

declare namespace jest {
	interface Matchers<R> {
		toBeCloseInSize(receivedSize: number, expectedSize: number): R;
		toFindMatchingKey(receivedKey: string): R;
	}
}

// Modified from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/shelljs/index.d.ts
declare module 'shelljs' {
	const shell: {
		cd: (string) => void;
		exec: (string) => { stdout: string; stderr: string; code: number };
	};
	export = shell;
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
