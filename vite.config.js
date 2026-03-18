import fs from "node:fs/promises";
import path from "node:path";

import yaml from "js-yaml";
import { defineConfig } from "vite";

import { parseStory } from "./src/runtime/parseStory.js";

const STORY_SECTION_RE = /^---\n([\s\S]*?)\n---\n*/gm;

function validateSectionRaw(raw) {
  const source = String(raw ?? "");

  if (!source.trim()) {
    return "Section content cannot be empty.";
  }

  if (!source.startsWith("---\n")) {
    return "Section must start with frontmatter delimited by ---";
  }

  const match = source.match(STORY_SECTION_RE);

  if (!match || match.index !== 0) {
    return "Section frontmatter is malformed.";
  }

  try {
    yaml.load(match[1]);
  } catch (error) {
    return error instanceof Error ? error.message : "Section frontmatter is invalid YAML.";
  }

  return null;
}

function normalizeSectionReplacement(raw, suffix) {
  const content = String(raw ?? "").replace(/\s+$/, "");

  if (!suffix.length) {
    return `${content}\n`;
  }

  if (suffix.startsWith("---")) {
    return `${content}\n\n`;
  }

  if (suffix.startsWith("\n")) {
    return `${content}\n`;
  }

  return content;
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function authoringSavePlugin() {
  return {
    name: "scrollytale-authoring-save",
    configureServer(server) {
      server.middlewares.use("/__authoring/save-section", async (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }

        try {
          const { id, raw } = await readJsonBody(req);
          const storyPath = path.resolve(server.config.root, "story.md");
          const source = await fs.readFile(storyPath, "utf8");
          const matches = [...source.matchAll(STORY_SECTION_RE)];
          const sections = matches.map((match, index) => {
            const config = yaml.load(match[1]) ?? {};
            const start = match.index;
            const end = index + 1 < matches.length ? matches[index + 1].index : source.length;

            return {
              id: config.id ?? null,
              start,
              end,
              raw: source.slice(start, end).trim(),
            };
          });
          const target = sections.find((section) => section.id === id);

          if (!target) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: `Section "${id}" not found.` }));
            return;
          }

          const suffix = source.slice(target.end);
          const validationError = validateSectionRaw(raw);

          if (validationError) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: false, error: validationError }));
            return;
          }

          const replacement = normalizeSectionReplacement(raw, suffix);
          const nextSource = source.slice(0, target.start) + replacement + suffix;

          try {
            parseStory(nextSource);
          } catch (error) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                ok: false,
                error:
                  error instanceof Error
                    ? `Save blocked: ${error.message}`
                    : "Save blocked by story syntax validation.",
              })
            );
            return;
          }

          await fs.writeFile(storyPath, nextSource, "utf8");
          server.watcher.emit("change", storyPath);

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              ok: false,
              error: error instanceof Error ? error.message : "Unknown save error.",
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
  },
  plugins: [authoringSavePlugin()],
});
