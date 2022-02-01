declare const __webpack_public_path__: string;

declare global {
	namespace jest {
		interface Matchers<R> {
			toBeCloseInSize(receivedSize: number, expectedSize: number): R;
			toFindMatchingKey(receivedKey: string): R;
		}
	}
}

export {};
