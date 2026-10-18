# Scrollytale

A greenfield MDX application for scroll-driven VisDelta stories. Write narrative in Markdown, import native chart states, and compose them with a small React component API. There is no YAML chart schema, legacy DSL or separate animation engine.

## Run

Requires Node 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

- Read: http://localhost:5173/
- Write: http://localhost:5173/authoring

`story.mdx` is the document. `src/story/housing.js` supplies the demo's native VisDelta states and fictional inline data. Replace those modules with your own data and states.

```mdx
import { Scrolly, Step } from './src/components/story.jsx'
import { states } from './src/story/my-story.js'

# A story worth following

<Scrolly id="example" title="A changing picture" states={states}>
  <Step>

## The first state

Ordinary Markdown explains the chart.

  </Step>
  <Step>

## The second state

Scroll to see the change.

  </Step>
</Scrolly>
```

Use exactly one direct `Step` per state. State order is explicit in the `states` array. Reuse a state to return to it. A one-state section renders a held static chart. Use `Hero` and `Chapter` for editorial sections; `Scrolly` supports left/right chart placement and stacks on narrow containers.

## Local authoring

The editor compiles native MDX with the same configuration as production. It preserves drafts across mode changes and restores unsaved text from tab session storage when available. External MDX file edits update the development reader without erasing the editor draft. Preview imports are resolved relative to the project root. Syntax/import failures keep the last preview and preserve the draft; render failures show the previous document with an error. Preview does not save. Save validates MDX syntax and writes the whole `story.mdx` atomically after a content-hash conflict check. Reload disk is explicit and confirms replacement of unsaved text.

This is a local, trusted-code authoring workflow. MDX imports and expressions execute project code. It is not a hosted editor for untrusted documents. Authoring endpoints and UI are development-only. Production is a static reader.

## Verify and publish

```sh
npm test
npm run build
npm run test:browser
npm run docs:build
npm run preview
```

Browser tests first build an independent static-render consumer under `dist/__verification`, then use the frozen `dist` production output for reader checks and the development server for editor checks. They run serially. Chrome is discovered at its standard macOS path; set `CHROME_PATH` elsewhere, or install Playwright Chromium and leave the variable unset. Build before running browser tests; do not rebuild while they run. The verification-only bundle can be deleted before deployment; `npm run build` always emits a clean reader.

The bundled demo covers Line, Bar, Point and Unit with genuine VisDelta sequences. Tests cover progress boundaries, reverse/jump/resize, pending initialization, cleanup and multiple instances; build success alone does not establish chart behavior.

See [component API](docs/reference.md), [authoring](docs/authoring.md), and [architecture and limitations](docs/architecture.md). VisDelta is pinned to the installed npm package `0.4.2`; no source aliases are used.
