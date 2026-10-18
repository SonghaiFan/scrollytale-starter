# Architecture and verification

## Ownership

- MDX compiler: Markdown, JSX, expressions and imports; story-only default Scrolly/Step provider.
- React: document composition, editor, theme and component lifecycle.
- Scrollytale: measured step anchors, hold policy, responsive narrative layouts and one playback owner per mode.
- VisDelta: immutable chart state, identity, transition planning, geometry, axes and frame evaluation.

The reader and documentation share the base MDX configuration. Only the story configuration adds MDX provider defaults for Scrolly and Step; the documentation entry does not load that runtime. The docs are a separate React entry, built with `npm run docs:build` to `docs/dist`; its base path is `/scrollytale-starter/`.

The reader imports the installed, unpublished `visdelta@0.4.3-dev.scrollytale.2` snapshot and its required stylesheet. The tarball is committed under `vendor/`, with source commit and SHA-256 recorded in `vendor/visdelta-snapshot.json`; `npm ci` reproduces the installation. It fixes runtime chart-root scope during sequence activation. It does not import VisDelta source or maintain another animation engine.

## Chart lifecycle

Each Step supplies a complete native chart. The component collects them in child order and retains equivalent declarations within its own mounted generation, comparing the complete spec and plugin identity. Immutable builder snapshots are cached by reference; new inline highlights with equivalent content reuse the session. Every effect generation owns a distinct child mount. Progress received before asynchronous initialization is buffered. When a replaced generation resolves, its controller is destroyed without seeking it. Mounted sessions use `resize()`; seeking restores its position while native playback retains its current frame and clock. Cleanup removes listeners, observers, scheduled frames, the controller and its private mount. Chart-style changes prepare a successor in a separate hidden mount while the current chart stays visible. At takeover the session reads the latest live frame and playback target, initializes the successor, then destroys the previous controller. A generation token rejects obsolete preparation; a failed successor preserves the live chart. No chart registration occurs through an inline callback ref.

Step positions are measured in document coordinates. Container, viewport, font or step-size changes remeasure them. Anchors are aligned to CSS pixels so browser scroll quantization still reaches exact authored boundaries. The forward and inverse mappings live in `src/runtime/progress.js`; optional sliders navigate through that same mapping. Default step mode calls native `play({to,duration})` only when the active Step changes; scroll mode calls `progress()`. The two modes never compete. React observes native playback values for diagnostics without driving its animation. Theme tokens live on the document root, followed by chart resize. Multiple stories keep independent mounts and progress.

## Verification

```sh
npm test
npm run build
npm run test:browser
npm run docs:build
```

Node tests cover real MDX compilation, syntax/conflict file preservation, authored boundaries, holds, inverse mapping, invalid input, async generation cleanup, single-state rendering, independent instances and resize position retention. Browser tests exercise frozen production output and the development editor. Builds are compilation checks, not visual or motion proofs.

## Standalone export

`npm run export:html -- [document.mdx] [--out exports/story.html]` uses a separate Vite configuration with no authoring plugin. It compiles the same native MDX provider into an IIFE with dynamic imports inlined, embeds the extracted CSS and imported assets, and writes one HTML file. A small standalone reader replaces the app shell, excluding routing and the editor. A rehype pass embeds local Markdown and literal JSX media. It reads saved source and leaves the normal `dist/` build untouched.

Inline and imported data are included. Runtime HTTP sources, remote embeds and fonts are not snapshotted; authors must supply local assets/data for offline use. A content security policy blocks external resource loading. Tests open actual `file://` outputs with networking disabled and check playback, progress, resize, theme, imported JSON/media and script-closing text.

## Current boundaries

- Trusted local authoring only. MDX is executable project code, not sanitized user content.
- Window scrolling only. A content-height cross-origin iframe needs a separate host integration; the reader displays a notice rather than claiming to observe parent scroll.
- `left` and `right` scrolly layouts plus editorial Hero/Chapter. Overlay, nested scrolling and automatic chart-type transitions are not provided.
- Step charts are immutable native declarations; inline expressions are supported without useMemo. Adjacent declarations must be supported by VisDelta. Chart initialization errors are visible in their section.
- One complete chart per direct Step; arbitrary wrappers around Step are unsupported.
- The application does not recreate old square scatter/unit marks, implicit aggregation, index-derived attention or silent row truncation.
- Draft text is kept in memory and restored from tab session storage when available. The editor installs a before-unload warning when dirty. Browser storage is optional, so saving remains the durable boundary.
