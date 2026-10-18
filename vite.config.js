import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import { mdxOptions } from "./tooling/mdx.js";
import { authoringPlugin } from "./tooling/authoring.js";

export default defineConfig({
  plugins: [authoringPlugin(), mdx(mdxOptions)],
  server: {
    host: "127.0.0.1",
    hmr: { overlay: false },
    watch: { ignored: ["**/docs/.vitepress/dist/**"] },
  },
});
