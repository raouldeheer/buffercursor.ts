import { BufferCursor } from "../src/buffercursor";
import { OverflowError } from "../src/overflowError";

type NumberLike = number | bigint;

function callTypeFunc(bc: BufferCursor, type: string, ...args: any[]) {
    // @ts-ignore
    return bc[type](...args);
}

function numbersToBytes(type: string, nrBytes: number, testNums: [NumberLike, NumberLike]) {
    return Buffer.concat(testNums.map(v => {
        const buf = new BufferCursor(Buffer.alloc(nrBytes));
        callTypeFunc(buf, `write${type}`, v);
        return buf.buffer;
    }));
}

function createNumberTest(type: string, nrBytes: number, testNums: [NumberLike, NumberLike]) {
    describe(type, () => {
        test(`write ${type}`, () => {
            const bc = new BufferCursor(Buffer.alloc(nrBytes * 2));
            callTypeFunc(bc, `write${type}`, testNums[0]);
            callTypeFunc(bc, `write${type}`, testNums[1]);
            expect(bc.buffer).toEqual(numbersToBytes(type, nrBytes, testNums));
            expect(() => callTypeFunc(bc, `write${type}`, testNums[0])).toThrow(OverflowError);
        });
        test(`read ${type}`, () => {
            const bc = new BufferCursor(numbersToBytes(type, nrBytes, testNums));
            callTypeFunc(bc, `read${type}`);
            callTypeFunc(bc, `read${type}`);
            expect(() => callTypeFunc(bc, `read${type}`)).toThrow(OverflowError);
        });
    });
}

describe("BufferCursor spec", () => {
    // INTS
    createNumberTest("Int8", 1, [0x55, 0x2A]);
    createNumberTest("UInt8", 1, [0x55, 0x2A]);
    createNumberTest("Int16LE", 2, [0x56D6, 0x2A53]);
    createNumberTest("UInt16LE", 2, [0x56D6, 0x2A53]);
    createNumberTest("Int16BE", 2, [0x56D6, 0x2A53]);
    createNumberTest("UInt16BE", 2, [0x56D6, 0x2A53]);
    createNumberTest("Int32LE", 4, [0x56D66D54, 0x2A539423]);
    createNumberTest("UInt32LE", 4, [0x56D66D54, 0x2A539423]);
    createNumberTest("Int32BE", 4, [0x56D66D54, 0x2A539423]);
    createNumberTest("UInt32BE", 4, [0x56D66D54, 0x2A539423]);
    createNumberTest("BigInt64LE", 8, [BigInt("6257308941279456596"), BigInt("3049944251414844451")]);
    createNumberTest("BigInt64BE", 8, [BigInt("6257308941279456596"), BigInt("3049944251414844451")]);
    createNumberTest("BigUInt64LE", 8, [BigInt("6257308941279456596"), BigInt("3049944251414844451")]);
    createNumberTest("BigUInt64BE", 8, [BigInt("6257308941279456596"), BigInt("3049944251414844451")]);

    // FLOATS
    createNumberTest("FloatLE", 4, [1301068908.3941, 1662506964.2258]);
    createNumberTest("FloatBE", 4, [1301068908.3941, 1662506964.2258]);
    createNumberTest("DoubleLE", 8, [1301068908.3941, 1662506964.2258]);
    createNumberTest("DoubleBE", 8, [1301068908.3941, 1662506964.2258]);

    test("isBufferCursor", () => {
        const buf = new BufferCursor(Buffer.alloc(4));
        expect(BufferCursor.isBufferCursor(buf)).toBeTruthy();
        expect(BufferCursor.isBufferCursor({})).toBeFalsy();
    });
});
