export class OverflowError extends RangeError {
    constructor(length: number, pos: number, size: number) {
        super(`OverflowError: length ${length}, position ${pos}, size ${size}`);
        this.name = "OverflowError";
    }
}
