declare global {
	const __webpack_public_path__: string;
	namespace jest {
		interface Matchers<R> {
			toBeCloseInSize(receivedSize: number, expectedSize: number): R;
			toFindMatchingKey(receivedKey: string): R;
		}
	}
}

export {};
