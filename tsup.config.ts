import { defineConfig } from 'tsup';

export default defineConfig((options) => {
    return {
        minify: !options.watch,
        entry: ['src/index.ts'],
        clean: true,
        dts: true,
        format: ["esm", "cjs"],
    };
});
