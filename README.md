# BufferCursor.ts

A simple package that allows you to traverse a Buffer iteratively. You
can read and write different types and the cursor's position will update with the proper size, which you can see through `.tell()` you can also
`.seek()`

## Example

```typescript
import { BufferCursor } from "buffercursor.ts";

const bc = new BufferCursor(Buffer.alloc(10));
bc.writeUInt16BE(123456789);
bc.writeUInt8(123456789);
bc.writeUInt32BE(123456789);
bc.seek(0);
bc.readUInt16BE();
bc.readUInt8();
bc.readUInt32BE();
console.log(bc.tell()); // Current cursor position (7)
```

## Methods

See `.d.ts`

For the most part `BufferCursor` and `Buffer` share the same methods, there's just a slight alteration in method signature, read and write methods don't take an offset. (BigInt support)

So `.readUInt16LE(10)` in `Buffer` is equivalent to `bc.seek(10); bc.readUInt16LE();`

All `read` and `write` methods are reproduced, as are `toString`, `write`, `fill`, `copy`, and `slice`. All of these methods will move the cursor through the buffer and do not take an offset parameter, where an `end` parameter would normaly be used, here you supply a `length`.

Additional methods:

 - `move(steps)` Moves the cursors by the amount of steps given.
 - `seek(value)` Moves the cursor to given position.
 - `tell()` Return the cursor position.
 - `eof()` Checks and returns if the cursor is at the end of the buffer.
 - `getBuffer()` Makes a copy of the part of the buffer before the cursor position.
 - `writeBuff(buff, length)` Writes a buffer to the buffer of given length.

## Properties

 - `buffer` The raw buffer
 - `length` Size of the raw buffer

## OverflowError

The `OverflowError` is throw when trying to read or write beyond buffer.

## Inspiration
This project was heavily inspired by [node-buffercursor by tjfontaine](https://github.com/tjfontaine/node-buffercursor), but it is sadly no longer maintained. My first attempt at building this library was based on a fork of node-buffercursor. Since the project has matured, it was moved out to its own repository.
