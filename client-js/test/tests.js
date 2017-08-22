describe('encode', () => {
    describe('base64', () => {
        const input = 'SGVsbG8gd29ybGQh';
        const output = new Uint8Array([
            72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33
        ]);
        it('toBuffer', () => {
            const buffer = encode.base64.toBuffer(input)
            expect(new Uint8Array(buffer)).toEqual(output);
        });
        it('fromBuffer', () => {
            expect(encode.base64.fromBuffer(output)).toEqual(input);
        });
    });
    describe('hex', () => {
        const input = '48656c6c6f20776f726c6421';
        const output = new Uint8Array([
            72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33
        ]);
        it('toBuffer', () => {
            const buffer = encode.hex.toBuffer(input)
            expect(new Uint8Array(buffer)).toEqual(output);
        });
        it('fromBuffer', () => {
            expect(encode.hex.fromBuffer(output)).toEqual(input);
        });
    });
    describe('string', () => {
        const input = 'Hello world!';
        const output = new Uint8Array([
            72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33
        ]);
        it('toBuffer', () => {
            const buffer = encode.string.toBuffer(input)
            expect(new Uint8Array(buffer)).toEqual(output);
        });
        it('fromBuffer', () => {
            expect(encode.string.fromBuffer(output)).toEqual(input);
        });
    });
    describe('utf8', () => {
        const input = 'Hello, 世界';
        const output = new Uint8Array([
            72, 101, 108, 108, 111, 44, 32, 228, 184, 150, 231, 149, 140
        ]);
        it('toBuffer', () => {
            const buffer = encode.utf8.toBuffer(input)
            expect(new Uint8Array(buffer)).toEqual(output);
        });
        it('fromBuffer', () => {
            expect(encode.utf8.fromBuffer(output)).toEqual(input);
        });
    });
});
