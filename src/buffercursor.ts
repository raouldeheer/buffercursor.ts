import { OverflowError } from "./overflowError";

/**
 * @class BufferCursor
 * @classdesc BufferCursor provides a cursor to make using a Buffer easier.
 * @since v1.0.0
 */
export class BufferCursor {
    private pos: number;
    public readonly buffer: Buffer;
    public readonly length: number;
    __isBufferCursor__ = true;

    /**
     * @constructor
     * @since v1.0.0
     * @param buff buffer to use as target.
     */
    constructor(buff: Buffer) {
        if (!(buff instanceof Buffer))
            throw new TypeError("Argument must be an instance of Buffer");
        this.pos = 0;
        this.buffer = buff;
        this.length = buff.length;
    }

    /**
     * checkMove checks if a move is allowed.
     * @since v1.0.0
     * @param {number} size size of the move to check for.
     */
    private checkMove(size: number): void {
        if ((size > this.length) || (this.length - this.pos < size))
            throw new OverflowError(this.length, this.pos, size);
    }

    /**
     * safeMove runs a function safely with a move.
     * @since v1.0.0
     * @template T 
     * @param {() => T} func function to run safely.
     * @param {number} steps number of steps to move.
     * @returns {T} return value of the function.
     */
    private safeMove<T>(func: () => T, steps: number): T {
        this.checkMove(steps);
        const ret = func();
        this.move(steps);
        return ret;
    }

    /**
     * move moves the cursors by the amount of steps given.
     * @since v1.0.0
     * @param {number} step number of steps to move
     */
    public move(step: number): void {
        const pos = this.pos + step;
        if (pos < 0) throw new RangeError("Cannot move before start of buffer");
        if (pos > this.length) throw new RangeError("Trying to move beyond buffer");
        this.pos = pos;
    }

    /**
     * getBuffer makes a copy of the part of the buffer before the cursor position.
     * @since v1.0.0
     * @returns {Buffer} the buffer with a copy of data until cursor position.
     */
    public getBuffer(): Buffer {
        const result = Buffer.allocUnsafe(this.pos);
        this.buffer.copy(result, 0, 0, this.pos);
        return result;
    }

    /**
     * seek moves the cursor to given position.
     * @since v1.0.0
     * @param {number} pos position to move to.
     * @returns {this} this buffercursor.
     */
    public seek(pos: number): this {
        if (pos < 0) throw new RangeError("Cannot seek before start of buffer");
        if (pos > this.length) throw new RangeError("Trying to seek beyond buffer");
        this.pos = pos;
        return this;
    }

    /**
     * eof checks and returns if the cursor is at the end of the buffer.
     * @since v1.0.0
     * @returns {boolean} true if cursor position is at the end of the buffer.
     */
    public eof(): boolean {
        return this.pos == this.length;
    }

    /**
     * tell return the cursor position.
     * @since v1.0.0
     * @returns {number} cursor position.
     */
    public tell(): number {
        return this.pos;
    }

    /**
     * Returns a new `BufferCursor` that references the same memory as the original, 
     * but offset and cropped by the `current position` and `current position + length` or `end` indices.
     * @since v1.0.0 
     * @param {number | undefined} length The length of the new `BufferCursor`.
     * @returns {BufferCursor} a new `BufferCursor` that references the same memory as the original.
     */
    public slice(length?: number): BufferCursor {
        const end = length === undefined ? this.length : this.pos + length;

        const buf = new BufferCursor(this.buffer.subarray(this.pos, end));
        this.seek(end);

        return buf;
    }

    /**
     * Decodes the `BufferCursor` to a string according to the specified character encoding in `encoding`. 
     * `length` may be passed to decode only a subset of the `BufferCursor`.
     * @since v1.0.0
     * @param {BufferEncoding | undefined} encoding The character encoding to use. Default "utf8".
     * @param {number | undefined} length The number of bytes to decode.
     * @returns {string} a string according to the specified character encoding.
     */
    public toString(encoding: BufferEncoding = "utf8", length?: number): string {
        const end = length === undefined ? this.length : this.pos + length;

        const ret = this.buffer.toString(encoding, this.pos, end);
        this.seek(end);
        return ret;
    }

    /**
     * write writes a string to the buffer of given length.
     * @since v1.0.0
     * @param {string} value the string to write to the buffer.
     * @param {number | undefined} length the length of the string to be writen.
     * @param {BufferEncoding | undefined} encoding the encoding to be used.
     * @returns {this} this buffercursor.
     */
    public write(value: string, length: number = value.length, encoding?: BufferEncoding): this {
        const ret = this.buffer.write(value, this.pos, length, encoding);
        this.move(ret);
        return this;
    }

    /**
     * writeBuff writes a buffer to the buffer of given length.
     * @since v1.0.0
     * @param {Buffer} value the buffer to write to the buffer.
     * @param {number | undefined} length the length of the buffer to be writen.
     * @returns {this} this buffercursor.
     */
    public writeBuff(value: Buffer, length: number = value.length): this {
        value.copy(this.buffer, this.pos, 0, length);
        this.move(length);
        return this;
    }

    /**
     * fill fills the buffer with the specified value. If length is not given, the entire buffer will be filled.
     * @since v1.0.0
     * @param {string | number | Uint8Array} value value to fill the buffer with.
     * @param {number | undefined} length amount of space to fill.
     * @returns {this} this buffercursor.
     */
    public fill(value: string | number | Uint8Array, length?: number): this {
        const end = length === undefined ? this.length : this.pos + length;
        this.checkMove(end - this.pos);

        this.buffer.fill(value, this.pos, end);
        this.seek(end);
        return this;
    }

    /**
     * copy copies data from a Buffer or BufferCursor to the current position.
     * @since v1.0.0
     * @param {BufferCursor | Buffer} source buffer to copy from.
     * @param {number | undefined} sourceStart position to start from.
     * @param {number | undefined} sourceEnd position to end.
     * @returns {this} this buffercursor.
     */
    public copy(source: BufferCursor | Buffer, sourceStart?: number, sourceEnd?: number): this {
        if (!sourceEnd) sourceEnd = source.length;
        if (!sourceStart) sourceStart = source instanceof BufferCursor ? source.pos : 0;

        const length = sourceEnd - sourceStart;
        this.checkMove(length);
        const buf = source instanceof BufferCursor ? source.buffer : source;

        buf.copy(this.buffer, this.pos, sourceStart, sourceEnd);
        this.move(length);
        return this;
    }

    /**
     * Reads an unsigned 8-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned 8-bit integer.
     */
    public readUInt8(): number {
        return this.safeMove(() => this.buffer.readUInt8(this.pos), 1);
    }

    /**
     * Reads a signed 8-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed 8-bit integer.
     */
    public readInt8(): number {
        return this.safeMove(() => this.buffer.readInt8(this.pos), 1);
    }

    /**
     * Reads a signed, big-endian 16-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, big-endian 16-bit integer.
     */
    public readInt16BE(): number {
        return this.safeMove(() => this.buffer.readInt16BE(this.pos), 2);
    }

    /**
     * Reads a signed, little-endian 16-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, little-endian 16-bit integer.
     */
    public readInt16LE(): number {
        return this.safeMove(() => this.buffer.readInt16LE(this.pos), 2);
    }

    /**
     * Reads an unsigned, big-endian 16-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, big-endian 16-bit integer.
     */
    public readUInt16BE(): number {
        return this.safeMove(() => this.buffer.readUInt16BE(this.pos), 2);
    }

    /**
     * Reads an unsigned, little-endian 16-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, little-endian 16-bit integer.
     */
    public readUInt16LE(): number {
        return this.safeMove(() => this.buffer.readUInt16LE(this.pos), 2);
    }

    /**
     * Reads an unsigned, little-endian 32-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, little-endian 32-bit integer.
     */
    public readUInt32LE(): number {
        return this.safeMove(() => this.buffer.readUInt32LE(this.pos), 4);
    }

    /**
     * Reads an unsigned, big-endian 32-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, big-endian 32-bit integer.
     */
    public readUInt32BE(): number {
        return this.safeMove(() => this.buffer.readUInt32BE(this.pos), 4);
    }

    /**
     * Reads a signed, little-endian 32-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, little-endian 32-bit integer.
     */
    public readInt32LE(): number {
        return this.safeMove(() => this.buffer.readInt32LE(this.pos), 4);
    }

    /**
     * Reads a signed, big-endian 32-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, big-endian 32-bit integer.
     */
    public readInt32BE(): number {
        return this.safeMove(() => this.buffer.readInt32BE(this.pos), 4);
    }

    /**
     * Reads an unsigned, little-endian 64-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, little-endian 64-bit integer.
     */
    public readBigUInt64LE(): bigint {
        return this.safeMove(() => this.buffer.readBigUInt64LE(this.pos), 8);
    }

    /**
     * Reads an unsigned, big-endian 64-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} an unsigned, big-endian 64-bit integer.
     */
    public readBigUInt64BE(): bigint {
        return this.safeMove(() => this.buffer.readBigUInt64BE(this.pos), 8);
    }

    /**
     * Reads a signed, little-endian 64-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, little-endian 64-bit integer.
     */
    public readBigInt64LE(): bigint {
        return this.safeMove(() => this.buffer.readBigInt64LE(this.pos), 8);
    }

    /**
     * Reads a signed, big-endian 64-bit integer from buffercursor.
     * @since v1.0.0
     * @returns {number} a signed, big-endian 64-bit integer.
     */
    public readBigInt64BE(): bigint {
        return this.safeMove(() => this.buffer.readBigInt64BE(this.pos), 8);
    }

    /**
     * Reads a 32-bit, big-endian float from buffercursor.
     * @since v1.0.0
     * @returns {number} a 32-bit, big-endian float.
     */
    public readFloatBE(): number {
        return this.safeMove(() => this.buffer.readFloatBE(this.pos), 4);
    }

    /**
     * Reads a 32-bit, little-endian float from buffercursor.
     * @since v1.0.0
     * @returns {number} a 32-bit, little-endian float.
     */
    public readFloatLE(): number {
        return this.safeMove(() => this.buffer.readFloatLE(this.pos), 4);
    }

    /**
     * Reads a 64-bit, big-endian double from buffercursor.
     * @since v1.0.0
     * @returns {number} a 64-bit, big-endian double.
     */
    public readDoubleBE(): number {
        return this.safeMove(() => this.buffer.readDoubleBE(this.pos), 8);
    }

    /**
     * Reads a 64-bit, little-endian double from buffercursor.
     * @since v1.0.0
     * @returns {number} a 64-bit, little-endian double.
     */
    public readDoubleLE(): number {
        return this.safeMove(() => this.buffer.readDoubleLE(this.pos), 8);
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeUInt8(value: number): this {
        this.safeMove(() => this.buffer.writeUInt8(value, this.pos), 1);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeInt8(value: number): this {
        this.safeMove(() => this.buffer.writeInt8(value, this.pos), 1);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeUInt16BE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt16BE(value, this.pos), 2);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeUInt16LE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt16LE(value, this.pos), 2);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeInt16BE(value: number): this {
        this.safeMove(() => this.buffer.writeInt16BE(value, this.pos), 2);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeInt16LE(value: number): this {
        this.safeMove(() => this.buffer.writeInt16LE(value, this.pos), 2);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeUInt32BE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt32BE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeUInt32LE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt32LE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeInt32BE(value: number): this {
        this.safeMove(() => this.buffer.writeInt32BE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeInt32LE(value: number): this {
        this.safeMove(() => this.buffer.writeInt32LE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeBigUInt64LE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigUInt64LE(value, this.pos), 8);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeBigUInt64BE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigUInt64BE(value, this.pos), 8);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeBigInt64LE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigInt64LE(value, this.pos), 8);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeBigInt64BE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigInt64BE(value, this.pos), 8);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeFloatBE(value: number): this {
        this.safeMove(() => this.buffer.writeFloatBE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeFloatLE(value: number): this {
        this.safeMove(() => this.buffer.writeFloatLE(value, this.pos), 4);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeDoubleBE(value: number): this {
        this.safeMove(() => this.buffer.writeDoubleBE(value, this.pos), 8);
        return this;
    }

    /**
     * Writes value to buffercursor at the current position.
     * @since v1.0.0
     * @param value Number to be written to buffercursor.
     * @returns {this} this buffercursor.
     */
    public writeDoubleLE(value: number): this {
        this.safeMove(() => this.buffer.writeDoubleLE(value, this.pos), 8);
        return this;
    }

    /**
     * isBufferCursor checks if target object is an instance of BufferCursor.
     * @param target obj to check.
     * @returns true if target is BufferCursor.
     */
    public static isBufferCursor(target: any): target is BufferCursor {
        return (target && "__isBufferCursor__" in target && target["__isBufferCursor__"]) === true;
    }
}
