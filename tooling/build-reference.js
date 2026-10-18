// Build an independent static-render consumer before the frozen browser run.
import { build } from "vite";
import mdx from "@mdx-js/rollup";
import { storyMdxOptions } from "./mdx.js";
await build({
  configFile: false,
  plugins: [mdx(storyMdxOptions)],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "dist/__verification",
    emptyOutDir: true,
    lib: {
      entry: "tests/reference.js",
      formats: ["es"],
      fileName: () => "reference.js",
    },
  },
});

const { readFile, writeFile } = await import("node:fs/promises");
const reader = await readFile("dist/index.html", "utf8");
const css = reader.match(/<link[^>]*rel="stylesheet"[^>]*>/g)?.join("\n") ?? "";
await writeFile(
  "dist/__verification/lifecycle.html",
  `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">${css}</head><body><div id="root"></div></body></html>`,
);
