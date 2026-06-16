import { readFileSync } from "node:fs";
import { defineConfig } from "tsup";

// Single source of truth for the version: read it from package.json at build
// time so `npm version patch` is the only place a version ever changes.
const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
);

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  // Bundle the workspace `@kumpsum/core` into the output so the published
  // package is fully self-contained with zero runtime dependencies.
  noExternal: ["@kumpsum/core"],
  define: { __VERSION__: JSON.stringify(version) },
  clean: true,
  shims: false,
  minify: false,
});
