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
import { bar } from 'visdelta'

export const chart = bar([
  { region: 'North', revenue: 18 },
  { region: 'South', revenue: 12 },
  { region: 'West', revenue: 9 },
]).x('region').y('revenue')

# One picture, three steps

<Scrolly>
  <Step chart={chart}>Start with every region.</Step>
  <Step chart={chart.highlight({ region: 'North' })}>Look north.</Step>
  <Step chart={chart}>Return to everyone.</Step>
</Scrolly>
```

`Scrolly` and `Step` are supplied automatically in story MDX. Every Step has a complete native `chart` declaration; steps do not inherit from one another. No states array, mandatory id or component import is needed. Ordinary MDX imports can override the defaults. A single Step renders a static chart. `layout` and `hold` are optional advanced controls.

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

See [component API](docs/reference.md), [authoring](docs/authoring.md), and [architecture and limitations](docs/architecture.md). VisDelta is pinned to the repository-vendored, unpublished `0.4.3-dev.scrollytale.1` integration package, which fixes a reproduced sequence font-scope issue. See [snapshot provenance](vendor/README.md) for its source commit and hash. No source aliases or temporary-path dependencies are used.
