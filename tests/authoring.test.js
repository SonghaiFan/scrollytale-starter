import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import { mdxOptions, storyMdxOptions } from "../tooling/mdx.js";
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
  const result = String(await compile(source, storyMdxOptions));
  assert.match(result, /react\/jsx-runtime/);
  assert.match(result, /revenue/);
  assert.match(result, /chart: chart/);
  assert.doesNotMatch(source, /states=|id=|title=|import.*Scrolly/);
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

test("the shared compiler supports Markdown tables without adding a custom DSL", async () => {
  const result = String(
    await compile(
      "| Field | Value |\n| --- | --- |\n| Region | Inner |\n",
      mdxOptions,
    ),
  );
  assert.match(result, /table/);
  assert.match(result, /thead/);
  assert.match(result, /tbody/);
});

test("story defaults use the official provider while docs stay independent and lexical imports win", async () => {
  const source = "<Scrolly><Step chart={chart}>Hello</Step></Scrolly>";
  const story = String(await compile(source, storyMdxOptions));
  assert.match(story, /useMDXComponents as _provideComponents/);
  assert.match(story, /\/src\/mdx-components\.jsx/);
  assert.match(story, /chart: chart/);
  const docs = String(await compile("# Documentation", mdxOptions));
  assert.doesNotMatch(docs, /mdx-components|story\.jsx|visdelta/);
  const overridden = String(
    await compile(
      "import { Scrolly, Step } from './custom.jsx'\n\n" + source,
      storyMdxOptions,
    ),
  );
  assert.match(overridden, /import \{Scrolly, Step\} from '\.\/custom\.jsx'/);
  assert.doesNotMatch(overridden, /const \{Scrolly, Step\}/);
});

test("the default starter is one native Bar with three independent Step charts", async () => {
  const source = await fs.readFile(
    new URL("../story.mdx", import.meta.url),
    "utf8",
  );
  assert.equal((source.match(/<Step chart=/g) ?? []).length, 3);
  assert.match(source, /bar\(\[/);
  assert.match(source, /highlight\(\{ region: 'North' \}\)/);
  assert.equal((source.match(/<Step chart=\{chart\}>/g) ?? []).length, 2);
  const advanced = await fs.readFile(
    new URL("../examples/housing.mdx", import.meta.url),
    "utf8",
  );
  await compile(advanced, storyMdxOptions);
  assert.doesNotMatch(advanced, /states=|States\[|const states/);
});
