import { OverflowError } from "./overflowError";

export class BufferCursor {
    private pos: number;
    public readonly buffer: Buffer;
    public readonly length: number;

    constructor(buff: Buffer) {
        if (!(buff instanceof Buffer))
            throw new TypeError("Argument must be an instance of Buffer");
        this.pos = 0;
        this.buffer = buff;
        this.length = buff.length;
    }

    /**
     * move moves the cursors by the amount of steps given.
     * @param step number of steps to move
     */
    public move(step: number): void {
        const pos = this.pos + step;
        if (pos < 0) throw new RangeError("Cannot move before start of buffer");
        if (pos > this.length) throw new RangeError("Trying to move beyond buffer");
        this.pos = pos;
    }

    private checkMove(size: number): void {
        if ((size > this.length) || (this.length - this.pos < size))
            throw new OverflowError(this.length, this.pos, size);
    }

    public getBuffer(offset = 0): Buffer {
        const result = Buffer.allocUnsafe(this.pos);
        this.buffer.copy(result, offset, 0, this.pos);
        return result;
    }

    public seek(pos: number): this {
        if (pos < 0) throw new RangeError("Cannot seek before start of buffer");
        if (pos > this.length) throw new RangeError("Trying to seek beyond buffer");
        this.pos = pos;
        return this;
    }

    public eof(): boolean {
        return this.pos == this.length;
    }

    public tell(): number {
        return this.pos;
    }

    /**
     * Returns a new `BufferCursor` that references the same memory as the original, 
     * but offset and cropped by the `current position` and `current position + length` or `end` indices.
     * @since v1.0.0 
     * @param length The length of the new `BufferCursor`.
     * @returns a new `BufferCursor` that references the same memory as the original.
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
     * @param encoding The character encoding to use.
     * @param length The number of bytes to decode.
     * @returns a string according to the specified character encoding
     */
    public toString(encoding: BufferEncoding = "utf8", length?: number): string {
        const end = length === undefined ? this.length : this.pos + length;

        const ret = this.buffer.toString(encoding, this.pos, end);
        this.seek(end);
        return ret;
    }

    public write(value: string, length: number, encoding?: BufferEncoding): this {
        const ret = this.buffer.write(value, this.pos, length, encoding);
        this.move(ret);
        return this;
    }

    public writeBuff(value: Buffer, length: number = value.length): this {
        value.copy(this.buffer, this.pos, 0, length);
        this.move(length);
        return this;
    }

    public fill(value: string | number | Uint8Array, length?: number): this {
        const end = length === undefined ? this.length : this.pos + length;
        this.checkMove(end - this.pos);

        this.buffer.fill(value, this.pos, end);
        this.seek(end);
        return this;
    }

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

    private safeMove<T>(func: () => T, length: number) {
        this.checkMove(length);
        const ret = func();
        this.move(length);
        return ret;
    }

    public readUInt8(): number {
        return this.safeMove(() => this.buffer.readUInt8(this.pos), 1);
    }

    public readInt8(): number {
        return this.safeMove(() => this.buffer.readInt8(this.pos), 1);
    }

    public readInt16BE(): number {
        return this.safeMove(() => this.buffer.readInt16BE(this.pos), 2);
    }

    public readInt16LE(): number {
        return this.safeMove(() => this.buffer.readInt16LE(this.pos), 2);
    }

    public readUInt16BE(): number {
        return this.safeMove(() => this.buffer.readUInt16BE(this.pos), 2);
    }

    public readUInt16LE(): number {
        return this.safeMove(() => this.buffer.readUInt16LE(this.pos), 2);
    }

    public readUInt32LE(): number {
        return this.safeMove(() => this.buffer.readUInt32LE(this.pos), 4);
    }

    public readUInt32BE(): number {
        return this.safeMove(() => this.buffer.readUInt32BE(this.pos), 4);
    }

    public readInt32LE(): number {
        return this.safeMove(() => this.buffer.readInt32LE(this.pos), 4);
    }

    public readInt32BE(): number {
        return this.safeMove(() => this.buffer.readInt32BE(this.pos), 4);
    }

    public readBigUint64LE(): bigint {
        return this.safeMove(() => this.buffer.readBigUint64LE(this.pos), 8);
    }

    public readBigUint64BE(): bigint {
        return this.safeMove(() => this.buffer.readBigUint64BE(this.pos), 8);
    }

    public readBigInt64LE(): bigint {
        return this.safeMove(() => this.buffer.readBigInt64LE(this.pos), 8);
    }

    public readBigInt64BE(): bigint {
        return this.safeMove(() => this.buffer.readBigInt64BE(this.pos), 8);
    }

    public readFloatBE(): number {
        return this.safeMove(() => this.buffer.readFloatBE(this.pos), 4);
    }

    public readFloatLE(): number {
        return this.safeMove(() => this.buffer.readFloatLE(this.pos), 4);
    }

    public readDoubleBE(): number {
        return this.safeMove(() => this.buffer.readDoubleBE(this.pos), 8);
    }

    public readDoubleLE(): number {
        return this.safeMove(() => this.buffer.readDoubleLE(this.pos), 8);
    }

    public writeUInt8(value: number): this {
        this.safeMove(() => this.buffer.writeUInt8(value, this.pos), 1);
        return this;
    }

    public writeInt8(value: number): this {
        this.safeMove(() => this.buffer.writeInt8(value, this.pos), 1);
        return this;
    }

    public writeUInt16BE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt16BE(value, this.pos), 2);
        return this;
    }

    public writeUInt16LE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt16LE(value, this.pos), 2);
        return this;
    }

    public writeInt16BE(value: number): this {
        this.safeMove(() => this.buffer.writeInt16BE(value, this.pos), 2);
        return this;
    }

    public writeInt16LE(value: number): this {
        this.safeMove(() => this.buffer.writeInt16LE(value, this.pos), 2);
        return this;
    }

    public writeUInt32BE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt32BE(value, this.pos), 4);
        return this;
    }

    public writeUInt32LE(value: number): this {
        this.safeMove(() => this.buffer.writeUInt32LE(value, this.pos), 4);
        return this;
    }

    public writeInt32BE(value: number): this {
        this.safeMove(() => this.buffer.writeInt32BE(value, this.pos), 4);
        return this;
    }

    public writeInt32LE(value: number): this {
        this.safeMove(() => this.buffer.writeInt32LE(value, this.pos), 4);
        return this;
    }

    public writeBigUint64LE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigUint64LE(value, this.pos), 8);
        return this;
    }

    public writeBigUint64BE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigUint64BE(value, this.pos), 8);
        return this;
    }

    public writeBigInt64LE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigInt64LE(value, this.pos), 8);
        return this;
    }

    public writeBigInt64BE(value: bigint): this {
        this.safeMove(() => this.buffer.writeBigInt64BE(value, this.pos), 8);
        return this;
    }

    public writeFloatBE(value: number): this {
        this.safeMove(() => this.buffer.writeFloatBE(value, this.pos), 4);
        return this;
    }

    public writeFloatLE(value: number): this {
        this.safeMove(() => this.buffer.writeFloatLE(value, this.pos), 4);
        return this;
    }

    public writeDoubleBE(value: number): this {
        this.safeMove(() => this.buffer.writeDoubleBE(value, this.pos), 8);
        return this;
    }

    public writeDoubleLE(value: number): this {
        this.safeMove(() => this.buffer.writeDoubleLE(value, this.pos), 8);
        return this;
    }
}