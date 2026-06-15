// The generation engine now lives in the shared `@kumpsum/core` package so the
// web UI and the `kumpsum` CLI use one source of truth. Re-exported here to keep
// the `@/lib/lorem` import path stable for existing components.
export * from "@kumpsum/core";
