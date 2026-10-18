import { defineConfig } from "vite";
import mdx from "@mdx-js/rollup";
import { storyMdxOptions } from "./tooling/mdx.js";
import { authoringPlugin } from "./tooling/authoring.js";

export default defineConfig({
  plugins: [authoringPlugin(), mdx(storyMdxOptions)],
  server: {
    host: "127.0.0.1",
    hmr: { overlay: false },
    watch: { ignored: ["**/docs/dist/**", "**/dist/**", "**/test-results/**"] },
  },
});
