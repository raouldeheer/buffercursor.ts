import { defineConfig } from 'tsup';

export default defineConfig((options) => {
    return {
        target: "node14",
        minify: !options.watch,
        entry: ['src/index.ts'],
        clean: true,
        format: ["esm", "cjs"],
    };
});
