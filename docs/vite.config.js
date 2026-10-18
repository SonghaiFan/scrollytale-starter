import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import { mdxOptions } from "../tooling/mdx.js";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  base: "/scrollytale-starter/",
  plugins: [mdx(mdxOptions)],
  server: { host: "127.0.0.1" },
});
