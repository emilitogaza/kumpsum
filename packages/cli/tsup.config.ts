import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  // Bundle the workspace `@kumpsum/core` into the output so the published
  // package is fully self-contained with zero runtime dependencies.
  noExternal: ["@kumpsum/core"],
  clean: true,
  shims: false,
  minify: false,
});
