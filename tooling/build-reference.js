// Build an independent static-render consumer before the frozen browser run.
import { build } from "vite";
await build({
  configFile: false,
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
