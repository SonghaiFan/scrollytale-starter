import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import { mdxOptions } from "../tooling/mdx.js";
import {
  saveDocument,
  validateSource,
  versionOf,
} from "../tooling/authoring.js";

test("the actual story compiles with the production MDX configuration", async () => {
  const source = await fs.readFile(
    new URL("../story.mdx", import.meta.url),
    "utf8",
  );
  const result = String(await compile(source, mdxOptions));
  assert.match(result, /react\/jsx-runtime/);
  assert.match(result, /housingStates/);
  assert.match(result, /Scrolly/);
  await assert.rejects(validateSource("<Scrolly>\n\nbroken"));
});
test("syntax errors and disk conflicts preserve the entire existing file", async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "scrollytale-save-"),
  );
  const file = path.join(directory, "story.mdx");
  const initial = "# First\n",
    replacement = "# Second\n";
  try {
    await fs.writeFile(file, initial);
    await assert.rejects(saveDocument(file, "<Broken", versionOf(initial)));
    assert.equal(await fs.readFile(file, "utf8"), initial);
    await fs.writeFile(file, "# External edit\n");
    await assert.rejects(saveDocument(file, replacement, versionOf(initial)), {
      status: 409,
    });
    assert.equal(await fs.readFile(file, "utf8"), "# External edit\n");
    const version = await saveDocument(
      file,
      replacement,
      versionOf("# External edit\n"),
    );
    assert.equal(version, versionOf(replacement));
    assert.equal(await fs.readFile(file, "utf8"), replacement);
  } finally {
    await fs.rm(directory, { recursive: true });
  }
});

test('the shared compiler supports Markdown tables without adding a custom DSL', async () => {
  const result = String(await compile('| Field | Value |\n| --- | --- |\n| Region | Inner |\n', mdxOptions));
  assert.match(result, /table/);
  assert.match(result, /thead/);
  assert.match(result, /tbody/);
});
