declare const __webpack_public_path__: string;

// Modified from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/shelljs/index.d.ts
declare module 'shelljs' {
	const shell: {
		cd: (string) => void;
		exec: (string) => { stdout: string; stderr: string; code: number };
	};
	export = shell;
}
