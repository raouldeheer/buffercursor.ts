/**
 * @class OverflowError
 * @extends RangeError
 * @classdesc OverflowError is an RangeError specific to the BufferCursor.
 * @since v1.0.0
 */
export class OverflowError extends RangeError {
    /**
     * @constructor
     * @since v1.0.0
     * @param length the length of the buffer.
     * @param pos the position of the cursor.
     * @param size the number of bytes attempted to be written.
     */
    constructor(length: number, pos: number, size: number) {
        super(`OverflowError: length ${length}, position ${pos}, size ${size}`);
        this.name = "OverflowError";
    }
}
