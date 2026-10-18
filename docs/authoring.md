# Authoring

## Document and data

Write `story.mdx` as a real MDX module. The default file contains three inline data rows, one native Bar declaration and three Steps. Scrolly and Step are provided by default. Put a complete chart on each Step; inline expressions such as `chart.highlight(...)` work without useMemo. Use imported data or chart modules when a story grows. The separate advanced example lives in `examples/housing.mdx`, backed by `src/story/housing.js`. There is no separate source registry.

MDX is compiled with `@mdx-js/rollup` and the standard `remark-gfm` plugin for tables and other GFM syntax. `tooling/mdx.js` defines the shared base configuration plus the story provider defaults. Production, editor preview, save validation and compilation tests use the same story configuration; docs use the base without narrative runtime imports. The runtime uses React's automatic JSX runtime. An optional `export const meta = { title: 'My story' }` sets the browser document title after a successful render.

## Editor loop

1. Run `npm run dev` and open `/authoring`.
2. Edit the complete MDX document.
3. Choose **Preview draft** to compile and import it without touching disk.
4. Choose **Save file** to validate syntax and replace `story.mdx`.

Switching between reading and authoring preserves the in-memory draft. External file edits refresh the development reader through the same preview compiler; the editor preserves its draft and offers Reload disk. Newer edits invalidate pending preview responses. Syntax and import errors preserve the current preview. Render errors display the previous working document with an error notice. A failed draft stays in the textarea. Preview replacement remounts the document; charts derive their positions from the current scroll geometry.

Save compares a SHA-256 hash of the disk source with the version loaded by the editor. If another editor changed the file, saving reports a conflict and keeps your draft. **Reload disk** asks before replacing unsaved text. Saves through this server are serialized and use a temporary file plus rename. This is a local conflict check, not a collaborative editing protocol.

Saving validates MDX syntax, not every possible runtime expression or remote data source. Use Preview and inspect chart errors before saving. A syntactically valid module can still throw at runtime.

## Production

`npm run build` emits a static reader to `dist`. It includes the document and imported state modules; it contains no authoring server. Preview/save are intentionally unavailable in production. Deploy at the site root; subpath hosting is not currently configured. The `/examples/housing` reader route requires the host to serve `index.html` for that path.
