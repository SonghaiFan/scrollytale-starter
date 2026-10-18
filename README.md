# Scrollytale

Write Markdown. Put a native VisDelta `chart` on each `Step`. Scroll through the story.

## Start

Requires Node 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

Open http://localhost:5173/ to read, or http://localhost:5173/authoring to edit and preview `story.mdx`.

The complete starter is a small Bar story:

```mdx
import { bar } from 'visdelta'

export const chart = bar([
  { region: 'North', revenue: 18 },
  { region: 'South', revenue: 12 },
  { region: 'West', revenue: 9 },
]).x('region').y('revenue')

# Three regions, one picture

<Scrolly>
  <Step chart={chart}>Compare everyone.</Step>
  <Step chart={chart.highlight({ region: 'North' })}>Look north.</Step>
  <Step chart={chart}>Return to everyone.</Step>
</Scrolly>
```

`Scrolly` and `Step` are supplied automatically. `chart` is a complete native VisDelta declaration. Each Step is independent; using `chart` again restores the original picture. Markdown, JSX, imports and expressions are standard MDX. Add blank lines around Markdown headings and paragraphs inside JSX.

To make it yours, change the rows, choose `.x(...)` and `.y(...)`, then rewrite the three steps. No states array, mandatory id, component import or second chart language is needed. Entering a Step plays to its chart by default. Use `<Scrolly mode="scroll">` to tie animation continuously to scrolling. Position sliders are hidden unless `controls` is supplied. `layout`, `duration` and scroll-mode `hold` are optional.

## Edit

**Preview draft** compiles without saving. **Save file** validates MDX syntax and writes the whole file after a disk-version check. Syntax/import errors keep the preview; render errors show the previous working document. Drafts survive reading/authoring navigation and restore from tab session storage when available. External `story.mdx` edits update the development reader without erasing a draft.

This is trusted local code authoring. MDX imports and expressions execute project code. The editor is development-only; production is a static reader. See [authoring](docs/authoring.md) for conflicts, reload and runtime errors.

## Export one offline HTML file

```sh
npm run export:html
# exports/story.html — the current saved story.mdx

npm run export:html -- examples/modes.mdx --out exports/modes.html
```

Share the resulting `.html` alone. It opens directly with `file://`, with no server or internet connection. The reader, VisDelta, all JavaScript chunks and CSS are embedded. Step playback, scroll progress, chart styles, theme switching and resize remain interactive. Export does not rebuild or replace `dist/`, change the story, or include the editor.

Data written in MDX or imported from local JSON/JavaScript modules is bundled. Imported media and CSS assets are inlined by Vite; Markdown images and literal JSX `src`/`poster` media paths are embedded too. Root-relative literal media paths resolve from `public/`. Use local media for offline export; remote media produces a build error instead of a broken exported image. Runtime HTTP data requests, embeds and external fonts are not downloaded or snapshotted: supply local data/assets before exporting. The standalone reader blocks external resource loading, while ordinary web links can still be opened deliberately. Only the selected document is exported; links to other project pages do not include those pages.

The exporter reads the saved MDX file, so save editor drafts first. Generated files live in the ignored `exports/` folder. `npm run test:offline` verifies real `file://` reads with networking disabled, including imported JSON, images and both scroll modes.

## Go further

Choose chart presentation directly in MDX: `<Scrolly chartStyle="paper">`. Presets are `d3`, `paper`, `dark`, and `editorial`; native `defineChartStyle(...)` modules are accepted too. See http://localhost:5173/examples/styles and the [component API](docs/reference.md).

Open http://localhost:5173/examples/visdelta for the VisDelta homepage demos adapted into MDX: Bar, Line, Area, Point and Unit step stories, followed by the revenue-to-profit scroll story. Native declarations and illustrative rows match the homepage source.

Open http://localhost:5173/examples/modes to compare step-triggered playback and continuous scroll progress on one page, using identical charts and steps. The navigation’s **Modes** link opens this example.

Open http://localhost:5173/examples/housing for the optional four-chart story, authored in [examples/housing.mdx](examples/housing.mdx) with native declarations from [src/story/housing.js](src/story/housing.js). It demonstrates Line, Bar, Point and Unit, continuous scroll progress, editorial sections and left/right layouts. It is separate from the default starter and editor. Production hosting must serve the reader's index for this example route.

- [Component API](docs/reference.md)
- [Architecture and current boundaries](docs/architecture.md)
- `npm run docs:dev` for the MDX documentation site

VisDelta owns chart declarations, rendering and animation. Scrollytale owns MDX, narrative components, scroll progress and the editing workflow. No React, MDX or scroll API has been added to VisDelta.

## Verify

```sh
npm test
npm run build
npm run test:browser
```

Browser tests build an independent static-render consumer and the docs, then run serially against frozen outputs. Editor tests use a disposable project on port 5183, so saves and external-edit checks leave your working `story.mdx` and port 5173 untouched. Tests retain the four-chart regression coverage alongside the simple default story. Chrome is discovered at its standard macOS path; set `CHROME_PATH` elsewhere, or install Playwright Chromium. Do not rebuild during a browser run.

`npm run build` emits a clean reader to `dist`; browser-only helpers under `dist/__verification` are not part of a normal production build. `npm run docs:build` builds the separate documentation entry to `docs/dist`.

VisDelta is pinned to the repository-vendored, unpublished `0.4.3-dev.scrollytale.2` integration package. [Snapshot provenance](vendor/README.md) records its source commit and hash. `npm ci` uses the installed package without a sibling checkout or source alias.
