import { defineConfig } from "tsup";

export default defineConfig((options) => {
    return {
        target: "node16",
        minify: !options.watch,
        entry: ["src/index.ts"],
        clean: true,
        format: ["esm", "cjs"],
    };
});
