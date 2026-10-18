import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import { storyMdxOptions } from "./mdx.js";

export const versionOf = (source) =>
  createHash("sha256").update(source).digest("hex");
export async function validateSource(source) {
  if (typeof source !== "string" || !source.trim())
    throw new Error("The MDX document cannot be empty.");
  if (Buffer.byteLength(source) > 1024 * 1024)
    throw new Error("The document exceeds the 1 MB limit.");
  await compile({ value: source, path: "story.mdx" }, storyMdxOptions);
}
export async function saveDocument(file, source, version) {
  await validateSource(source);
  const current = await fs.readFile(file, "utf8");
  if (version !== versionOf(current)) {
    const error = new Error(
      "story.mdx changed on disk. Reload the disk version before saving. Your draft is preserved.",
    );
    error.status = 409;
    throw error;
  }
  const temporary = `${file}.saving`;
  try {
    await fs.writeFile(temporary, source, "utf8");
    await fs.rename(temporary, file);
  } finally {
    await fs.rm(temporary, { force: true });
  }
  return versionOf(source);
}
export function authoringPlugin() {
  const drafts = new Map();
  let revision = 0;
  let root;
  let server;
  let internalVersion;
  let saveQueue = Promise.resolve();
  const previewFile = () => path.join(root, "__story_preview__.mdx");
  return {
    name: "scrollytale-authoring",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id.startsWith("/__story_preview__.mdx?revision="))
        return previewFile() + id.slice(id.indexOf("?"));
    },
    load(id) {
      if (id.startsWith(previewFile() + "?revision=")) {
        const source = drafts.get(id.slice(id.indexOf("=") + 1));
        if (source === undefined)
          throw new Error("Preview expired. Preview your draft again.");
        return source;
      }
    },
    async handleHotUpdate(context) {
      if (context.file !== path.join(root, "story.mdx")) return;
      const currentVersion = versionOf(await context.read());
      // MDX updates use the same compile/import preview path and never reload an editor draft.
      if (currentVersion !== internalVersion)
        server.ws.send({
          type: "custom",
          event: "scrollytale:source-changed",
          data: {},
        });
      internalVersion = undefined;
      return [];
    },
    configureServer(viteServer) {
      server = viteServer;
      server.middlewares.use("/__authoring", async (req, res, next) => {
        const route = req.url?.split("?")[0];
        if (!["/source", "/preview", "/save"].includes(route)) return next();
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        try {
          const file = path.join(root, "story.mdx");
          if (route === "/source" && req.method === "GET") {
            const source = await fs.readFile(file, "utf8");
            return res.end(
              JSON.stringify({ source, version: versionOf(source) }),
            );
          }
          if (req.method !== "POST") {
            res.statusCode = 405;
            return res.end(JSON.stringify({ error: "Use POST." }));
          }
          if (!req.headers["content-type"]?.startsWith("application/json"))
            throw new Error("Expected application/json.");
          if (
            req.headers.origin &&
            new URL(req.headers.origin).host !== req.headers.host
          )
            throw new Error("Cross-origin edits are not allowed.");
          const chunks = [];
          let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 1100000)
              throw new Error("Request exceeds the document limit.");
            chunks.push(chunk);
          }
          const { source, version } = JSON.parse(
            Buffer.concat(chunks).toString(),
          );
          await validateSource(source);
          if (route === "/preview") {
            const key = String(++revision);
            drafts.set(key, source);
            if (drafts.size > 30) drafts.delete(drafts.keys().next().value);
            return res.end(
              JSON.stringify({ url: `/__story_preview__.mdx?revision=${key}` }),
            );
          }
          const save = saveQueue.then(async () => {
            internalVersion = versionOf(source);
            try {
              return await saveDocument(file, source, version);
            } catch (error) {
              internalVersion = undefined;
              throw error;
            }
          });
          saveQueue = save.catch(() => {});
          return res.end(JSON.stringify({ version: await save }));
        } catch (error) {
          res.statusCode = error.status ?? 400;
          res.end(JSON.stringify({ error: error.message }));
        }
      });
    },
  };
}
