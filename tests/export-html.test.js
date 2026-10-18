import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { inlineStoryMedia } from '../tooling/export-html.js';
const filename = fileURLToPath(new URL('./offline/fixtures/assets.mdx', import.meta.url));

test('offline media embeds Markdown and literal JSX paths and reports missing/remote assets', async () => {
  const tree = { children: [
    { type: 'element', tagName: 'img', properties: { src: './icon.svg' } },
    { type: 'mdxJsxFlowElement', name: 'img', attributes: [{ name: 'src', value: './icon.svg' }] },
  ] };
  await inlineStoryMedia()()(tree, { path: filename });
  assert.match(tree.children[0].properties.src, /^data:image\/svg\+xml;base64,/);
  assert.equal(tree.children[0].properties.src, tree.children[1].attributes[0].value);
  for (const source of ['https://example.com/image.png', '//example.com/image.png', 'blob:old-session']) {
    await assert.rejects(inlineStoryMedia()()({ type: 'element', tagName: 'img', properties: { src: source } }, { path: filename }), /offline|Offline/);
  }
  await assert.rejects(inlineStoryMedia()()({ type: 'element', tagName: 'img', properties: { src: './missing.png' } }, { path: filename }), /ENOENT/);
});
