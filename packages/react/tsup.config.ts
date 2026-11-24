import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react", "@glimmerui/core"],
  // The components use hooks and the DOM, so frameworks with server components
  // (such as the Next.js App Router) must treat the bundle as client code.
  banner: { js: '"use client";' },
});
