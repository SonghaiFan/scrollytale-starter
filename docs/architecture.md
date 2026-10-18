# Architecture and verification

## Ownership

- MDX compiler: Markdown, JSX, expressions and imports.
- React: document composition, editor, theme and component lifecycle.
- Scrollytale: measured step anchors, hold policy, responsive narrative layouts and one scroll progress owner.
- VisDelta: immutable chart state, identity, transition planning, geometry, axes and frame evaluation.

The reader and documentation both use the shared MDX configuration. The docs are a separate React entry, built with `npm run docs:build` to `docs/dist`; its base path is `/scrollytale-starter/`.

The reader imports the installed `visdelta@0.4.2` package and its required stylesheet. It does not import VisDelta source or maintain another animation engine.

## Chart lifecycle

Every effect generation owns a distinct child mount. Progress received before asynchronous initialization is buffered. When a replaced generation resolves, its controller is destroyed without seeking it. Mounted sessions use `resize()` and restore their current position. Cleanup removes listeners, observers, scheduled frames, the controller and its private mount. No chart registration occurs through an inline callback ref.

Step positions are measured in document coordinates. Container, viewport, font or step-size changes remeasure them. Anchors are aligned to CSS pixels so browser scroll quantization still reaches exact authored boundaries. The forward and inverse mappings live in `src/runtime/progress.js`; sliders navigate through that same mapping. Theme tokens live on the document root, followed by chart resize. Multiple stories keep independent mounts and progress.

## Verification

```sh
npm test
npm run build
npm run test:browser
npm run docs:build
```

Node tests cover real MDX compilation, syntax/conflict file preservation, authored boundaries, holds, inverse mapping, invalid input, async generation cleanup, single-state rendering, independent instances and resize position retention. Browser tests exercise frozen production output and the development editor. Builds are compilation checks, not visual or motion proofs.

## Current boundaries

- Trusted local authoring only. MDX is executable project code, not sanitized user content.
- Window scrolling only. A content-height cross-origin iframe needs a separate host integration; the reader displays a notice rather than claiming to observe parent scroll.
- `left` and `right` scrolly layouts plus editorial Hero/Chapter. Overlay, nested scrolling and automatic chart-type transitions are not provided.
- Imported states must be stable and adjacent states must be supported by VisDelta. Chart initialization errors are visible in their section.
- One direct Step per state; arbitrary wrappers around Step are unsupported.
- The application does not recreate old square scatter/unit marks, implicit aggregation, index-derived attention or silent row truncation.
- Draft text is kept in memory and restored from tab session storage when available. The editor installs a before-unload warning when dirty. Browser storage is optional, so saving remains the durable boundary.
