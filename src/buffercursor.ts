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

    private checkWrite(size: number): void {
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
        this.checkWrite(end - this.pos);

        this.buffer.fill(value, this.pos, end);
        this.seek(end);
        return this;
    }

    public copy(source: BufferCursor | Buffer, sourceStart?: number, sourceEnd?: number): this {
        if (!sourceEnd) sourceEnd = source.length;
        if (!sourceStart) sourceStart = source instanceof BufferCursor ? source.pos : 0;

        const length = sourceEnd - sourceStart;
        this.checkWrite(length);
        const buf = source instanceof BufferCursor ? source.buffer : source;

        buf.copy(this.buffer, this.pos, sourceStart, sourceEnd);
        this.move(length);
        return this;
    }

    public readUInt8(): number {
        this.checkWrite(1);
        const ret = this.buffer.readUInt8(this.pos);
        this.move(1);
        return ret;
    }

    public readInt8(): number {
        this.checkWrite(1);
        const ret = this.buffer.readInt8(this.pos);
        this.move(1);
        return ret;
    }

    public readInt16BE(): number {
        this.checkWrite(2);
        const ret = this.buffer.readInt16BE(this.pos);
        this.move(2);
        return ret;
    }

    public readInt16LE(): number {
        this.checkWrite(2);
        const ret = this.buffer.readInt16LE(this.pos);
        this.move(2);
        return ret;
    }

    public readUInt16BE(): number {
        this.checkWrite(2);
        const ret = this.buffer.readUInt16BE(this.pos);
        this.move(2);
        return ret;
    }

    public readUInt16LE(): number {
        this.checkWrite(2);
        const ret = this.buffer.readUInt16LE(this.pos);
        this.move(2);
        return ret;
    }

    public readUInt32LE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readUInt32LE(this.pos);
        this.move(4);
        return ret;
    }

    public readUInt32BE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readUInt32BE(this.pos);
        this.move(4);
        return ret;
    }

    public readInt32LE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readInt32LE(this.pos);
        this.move(4);
        return ret;
    }

    public readInt32BE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readInt32BE(this.pos);
        this.move(4);
        return ret;
    }

    public readBigUint64LE(): bigint {
        this.checkWrite(8);
        const ret = this.buffer.readBigUint64LE(this.pos);
        this.move(8);
        return ret;
    }

    public readBigUint64BE(): bigint {
        this.checkWrite(8);
        const ret = this.buffer.readBigUint64BE(this.pos);
        this.move(8);
        return ret;
    }

    public readBigInt64LE(): bigint {
        this.checkWrite(8);
        const ret = this.buffer.readBigInt64LE(this.pos);
        this.move(8);
        return ret;
    }

    public readBigInt64BE(): bigint {
        this.checkWrite(8);
        const ret = this.buffer.readBigInt64BE(this.pos);
        this.move(8);
        return ret;
    }

    public readFloatBE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readFloatBE(this.pos);
        this.move(4);
        return ret;
    }

    public readFloatLE(): number {
        this.checkWrite(4);
        const ret = this.buffer.readFloatLE(this.pos);
        this.move(4);
        return ret;
    }

    public readDoubleBE(): number {
        this.checkWrite(8);
        const ret = this.buffer.readDoubleBE(this.pos);
        this.move(8);
        return ret;
    }

    public readDoubleLE(): number {
        this.checkWrite(8);
        const ret = this.buffer.readDoubleLE(this.pos);
        this.move(8);
        return ret;
    }

    public writeUInt8(value: number): this {
        this.checkWrite(1);
        this.buffer.writeUInt8(value, this.pos);
        this.move(1);
        return this;
    }

    public writeInt8(value: number): this {
        this.checkWrite(1);
        this.buffer.writeInt8(value, this.pos);
        this.move(1);
        return this;
    }

    public writeUInt16BE(value: number): this {
        this.checkWrite(2);
        this.buffer.writeUInt16BE(value, this.pos);
        this.move(2);
        return this;
    }

    public writeUInt16LE(value: number): this {
        this.checkWrite(2);
        this.buffer.writeUInt16LE(value, this.pos);
        this.move(2);
        return this;
    }

    public writeInt16BE(value: number): this {
        this.checkWrite(2);
        this.buffer.writeInt16BE(value, this.pos);
        this.move(2);
        return this;
    }

    public writeInt16LE(value: number): this {
        this.checkWrite(2);
        this.buffer.writeInt16LE(value, this.pos);
        this.move(2);
        return this;
    }

    public writeUInt32BE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeUInt32BE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeUInt32LE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeUInt32LE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeInt32BE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeInt32BE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeInt32LE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeInt32LE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeBigUint64LE(value: bigint): this {
        this.checkWrite(8);
        this.buffer.writeBigUint64LE(value, this.pos);
        this.move(8);
        return this;
    }

    public writeBigUint64BE(value: bigint): this {
        this.checkWrite(8);
        this.buffer.writeBigUint64BE(value, this.pos);
        this.move(8);
        return this;
    }

    public writeBigInt64LE(value: bigint): this {
        this.checkWrite(8);
        this.buffer.writeBigInt64LE(value, this.pos);
        this.move(8);
        return this;
    }

    public writeBigInt64BE(value: bigint): this {
        this.checkWrite(8);
        this.buffer.writeBigInt64BE(value, this.pos);
        this.move(8);
        return this;
    }

    public writeFloatBE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeFloatBE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeFloatLE(value: number): this {
        this.checkWrite(4);
        this.buffer.writeFloatLE(value, this.pos);
        this.move(4);
        return this;
    }

    public writeDoubleBE(value: number): this {
        this.checkWrite(8);
        this.buffer.writeDoubleBE(value, this.pos);
        this.move(8);
        return this;
    }

    public writeDoubleLE(value: number): this {
        this.checkWrite(8);
        this.buffer.writeDoubleLE(value, this.pos);
        this.move(8);
        return this;
    }
}