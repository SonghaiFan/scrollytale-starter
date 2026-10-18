import { build } from "vite";
import mdx from "@mdx-js/rollup";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storyMdxOptions } from "./mdx.js";

export const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const mimeTypes = {
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
  '.ogg': 'audio/ogg', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

// Markdown images and literal JSX media paths do not pass through JS imports.
// Embed those explicitly; imported assets are inlined by Vite's library build.
export function inlineStoryMedia(root = projectRoot) {
  return () => async (tree, file) => {
    async function inline(value) {
      if (!value || /^(data:|#)/i.test(value)) return value;
      if (/^(https?:|\/\/)/i.test(value)) throw new Error(`Offline export needs local media: ${value}. Download it into the project first.`);
      if (/^[a-z][a-z\d+.-]*:/i.test(value)) throw new Error(`Unsupported offline media URL: ${value}`);
      const [pathname, fragment] = value.split('#');
      const filename = pathname.split('?')[0];
      const location = filename.startsWith('/')
        ? path.resolve(root, 'public', decodeURIComponent(filename.slice(1)))
        : path.resolve(path.dirname(file.path), decodeURIComponent(filename));
      const mime = mimeTypes[path.extname(location).toLowerCase()];
      if (!mime) throw new Error(`Unsupported offline media type: ${value}. Import this asset explicitly instead.`);
      const bytes = await readFile(location);
      return `data:${mime};base64,${bytes.toString('base64')}${fragment ? `#${fragment}` : ''}`;
    }
    async function walk(node) {
      if (node.type === 'element' && ['img', 'video', 'audio', 'source'].includes(node.tagName)) {
        for (const key of ['src', 'poster']) {
          if (typeof node.properties?.[key] === 'string') node.properties[key] = await inline(node.properties[key]);
        }
      }
      if (['mdxJsxFlowElement', 'mdxJsxTextElement'].includes(node.type) && ['img', 'video', 'audio', 'source'].includes(node.name)) {
        for (const attribute of node.attributes ?? []) {
          if (['src', 'poster'].includes(attribute.name) && typeof attribute.value === 'string') attribute.value = await inline(attribute.value);
        }
      }
      for (const child of node.children ?? []) await walk(child);
    }
    await walk(tree);
  };
}

export async function exportHtml({ input = 'story.mdx', output = 'exports/story.html' } = {}) {
  const story = path.resolve(projectRoot, input);
  const destination = path.resolve(projectRoot, output);
  if (path.extname(story) !== '.mdx') throw new Error('Export input must be an .mdx document.');
  if (path.extname(destination) !== '.html') throw new Error('Export output must end in .html.');
  const result = await build({
    configFile: false,
    root: projectRoot,
    publicDir: false,
    plugins: [
      { name: 'standalone-story', resolveId(id) { if (id === 'virtual:standalone-story') return story; } },
      mdx({ ...storyMdxOptions, rehypePlugins: [inlineStoryMedia()] }),
    ],
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    build: {
      write: false,
      minify: 'esbuild',
      cssCodeSplit: false,
      sourcemap: false,
      lib: { entry: path.join(projectRoot, 'src/standalone.jsx'), name: 'ScrollytaleOffline', formats: ['iife'] },
      rollupOptions: { output: { inlineDynamicImports: true } },
    },
  });
  const files = (Array.isArray(result) ? result : [result]).flatMap(bundle => bundle.output);
  const scripts = files.filter(file => file.type === 'chunk');
  const css = files.filter(file => file.type === 'asset' && file.fileName.endsWith('.css'));
  const extra = files.filter(file => file.type === 'asset' && !file.fileName.endsWith('.css'));
  if (scripts.length !== 1 || extra.length) throw new Error('Offline export produced external resources; no HTML was written.');
  const js = scripts[0].code.replace(/<\/script/gi, '<\\/script');
  const styles = css.map(file => String(file.source)).join('\n').replace(/<\/style/gi, '<\\/style');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; media-src data: blob:; connect-src data: blob:; base-uri 'none'; form-action 'none'">
<title>Scrollytale</title><style>${styles}</style></head><body><div id="root"></div><noscript>This interactive story needs JavaScript enabled.</noscript><script>${js}</script></body></html>`;
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html);
  return { path: destination, bytes: Buffer.byteLength(html) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let input, output;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--out') {
      output = args[++i];
      if (!output || output.startsWith('--')) throw new Error('--out needs an HTML filename.');
    }
    else if (args[i].startsWith('--') || input) throw new Error('Usage: npm run export:html -- [story.mdx] [--out exports/story.html]');
    else input = args[i];
  }
  const result = await exportHtml({ input, output });
  console.log(`Exported ${result.path} (${(result.bytes / 1024 / 1024).toFixed(2)} MB)`);
}
