// Editor tests get a real Vite server and real disk saves in a disposable project.
// The user's story.mdx and development session on 5173 remain untouched.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
const project = fileURLToPath(new URL("..", import.meta.url));
const root = await fs.realpath(
  await fs.mkdtemp(path.join(os.tmpdir(), "scrollytale-authoring-")),
);
for (const name of [
  "src",
  "tooling",
  "tests",
  "examples",
  "story.mdx",
  "package.json",
  "vite.config.js",
  "index.html",
]) {
  try {
    await fs.cp(path.join(project, name), path.join(root, name), {
      recursive: true,
    });
  } catch (error) {
    if (name !== "examples" || error.code !== "ENOENT") throw error;
  }
}
await fs.symlink(
  path.join(project, "node_modules"),
  path.join(root, "node_modules"),
  "dir",
);
const server = await createServer({
  root,
  configFile: path.join(root, "vite.config.js"),
  server: {
    host: "127.0.0.1",
    port: 5183,
    strictPort: true,
    fs: { allow: [project, root] },
  },
  plugins: [
    {
      name: "test-location",
      configureServer(vite) {
        vite.middlewares.use("/__test__/location", (_req, res) => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ storyPath: path.join(root, "story.mdx") }));
        });
      },
    },
  ],
});
await server.listen();
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  await server.close();
  await fs.rm(root, { recursive: true, force: true });
  process.exit(0);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
