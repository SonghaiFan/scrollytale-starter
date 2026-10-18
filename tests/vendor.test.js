import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";

test("the installed VisDelta consumer matches the committed snapshot and provenance", async () => {
  const provenance = JSON.parse(
    await fs.readFile(
      new URL("../vendor/visdelta-snapshot.json", import.meta.url),
    ),
  );
  const bytes = await fs.readFile(
    new URL(`../vendor/${provenance.file}`, import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    provenance.sha256,
  );
  const installed = JSON.parse(
    await fs.readFile(
      new URL("../node_modules/visdelta/package.json", import.meta.url),
    ),
  );
  assert.equal(installed.version, provenance.version);
  assert.equal(installed.private, true);
  assert.equal(
    installed.visdeltaSnapshot.sourceCommit,
    provenance.sourceCommit,
  );
  assert.equal(
    installed.visdeltaSnapshot.contentsSha256,
    provenance.contentsSha256,
  );
  const pkg = JSON.parse(
    await fs.readFile(new URL("../package.json", import.meta.url)),
  );
  assert.equal(pkg.dependencies.visdelta, `file:vendor/${provenance.file}`);
});
