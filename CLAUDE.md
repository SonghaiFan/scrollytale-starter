# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install dependencies
npm run dev          # start dev server (http://localhost:5173)
npm run build        # production build
npm run preview      # preview production build
npm run docs:dev     # start VitePress docs site
npm run docs:build   # build VitePress docs
```

There are no test scripts defined. Development is verified manually via the browser.

Two app modes are available during development:
- **Presenting**: `http://localhost:5173/`
- **Authoring**: `http://localhost:5173/authoring`

## Architecture Overview

This is a Markdown-driven scrollytelling runtime. The entry point is `story.md`, which is imported raw by Vite and processed entirely in the browser at boot time.

### Boot Flow

`src/main.js` → mounts Vue app (`src/app/App.js`) → on mount:
1. `parseStory(storySource)` — parses `story.md` into raw sections
2. `normalizeStory(parsed)` — validates and normalizes to the internal story model
3. `loadSources(story.data.sources)` — fetches CSV/JSON files via Arquero
4. Passes `story`, `sources`, `layouts`, and `visualizations` to `StoryRuntime`

### Story Model Pipeline

`src/runtime/parseStory.js` handles two formats:
- **Current format**: frontmatter-delimited sections (`---\nid: ...\n---\nbody`)
- **Legacy format**: `## Heading` + fenced `yaml` blocks

`src/runtime/normalizeStory.js` converts parsed sections into the normalized model. Each section becomes an object with: `id`, `layout`, `vis` (type, data, fields, options), `copy` (steps, annotations), `headline`, `dek`, `body`, `raw`.

### Rendering

`src/runtime/renderStory.js` renders each section imperatively into a `.story-root` div:
1. Calls the appropriate **layout renderer** (`src/layouts/`) to produce DOM + `.step` elements
2. Calls the appropriate **visualization renderer** (`src/visualizations/`) to produce a `{ update, resize, destroy }` controller
3. Wires scrollama for `scrolly-*` layouts — each `::step` enter triggers `visController.update(payload)`

`StoryRuntime` (`src/app/StoryRuntime.js`) is a Vue wrapper around `renderStory` that handles mounting/teardown lifecycle and emits nav targets.

### Layout Renderers (`src/layouts/`)

Each layout renderer receives `{ section, markdown }` and returns `{ element, figure, steps }`.

| Layout | File |
|---|---|
| `chapter` | `chapter.js` — plain narrative, no sticky figure |
| `hero` | `hero.js` — full-bleed opening section |
| `scrolly-left` | `scrollyLeft.js` — sticky figure on left, text scrolls right |
| `scrolly-right` | `scrollyRight.js` — sticky figure on right, text scrolls left |
| `scrolly-overlay` | `scrollyOverlay.js` — text floats over full-bleed figure |
| `full-width` | `fullWidth.js` — figure spans full width |

### Visualization Renderers (`src/visualizations/`)

Each viz renderer receives `{ container, section, data }` and returns `{ update(payload), resize(), destroy() }`.

| Chart type | File | Notes |
|---|---|---|
| `bar` | `bar.js` | Observable Plot, supports `focus` in steps |
| `line` | `line.js` | Observable Plot, supports `focus` in steps |
| `scatter` | `scatter.js` | Observable Plot |
| `unit` | `unit.js` | D3 circle packing / unit chart |
| `html` | `html.js` | Raw HTML placeholder |
| `plot` | `plotNative.js` | Per-step `plot` code blocks evaluated via `new Function` |
| `vega-lite` | `vegaLiteNative.js` | Per-step `vega-lite` JSON/JS blocks, auto-injects data |

`frameworkShared.js` provides shared utilities: `loadPlotModule()` / `loadVegaEmbedModule()` (lazy singletons), `evaluateFrameworkSource()` (executes step code blocks with scope: `Plot`, `aq`, `d3`, `data`, `step`, `section`, `dimensions`).

### Authoring Mode

The authoring panel (`src/app/AuthoringPanel.js`) renders a side drawer at `/authoring` with per-section raw editors. Saves POST to `/__authoring/save-section` — a Vite dev server middleware defined in `vite.config.js`. The middleware reads `story.md`, patches the target section in-place, validates via `parseStory`, writes back, and triggers HMR.

### Vue App Shell (`src/app/`)

| File | Role |
|---|---|
| `App.js` | Root component — boots story, owns all state |
| `StoryRuntime.js` | Vue wrapper around the imperative `renderStory` engine |
| `AuthoringPanel.js` | Side drawer editor for authoring mode |
| `BottomNav.js` | Navigation bar with section markers and scroll progress |
| `routes.js` | Simple hash/path routing for presenting vs authoring modes |
| `navMarkers.js` | Maps vis types to nav marker shapes |

### Story DSL Quick Reference

Global frontmatter (first `---` block):
```yaml
title: "My Story"
data:
  housing: ./data/demo.csv
custom_style: ./src/styles/custom.css
chrome:
  bottom_nav: true
  theme_toggle: true
```

Section frontmatter contains only layout metadata — no chart type, field mappings, or data keys:
```yaml
id: my-section
layout: scrolly-right    # chapter|hero|scrolly-left|scrolly-right|scrolly-overlay|full-width
```

The chart is defined by code blocks. A **section-level code block** in the body sets the default/base chart for all steps in that section. Steps that need a different visual state include their own code block to override it; steps with no code block reuse the section-level chart:
````md
---
id: region-comparison
layout: scrolly-right
---

## Heading becomes the section headline

Body prose is rendered as normal HTML — not a step card.

```plot
Plot.barY(aq.from(sources.housing).groupby("region").rollup({ value: aq.op.sum("value") }).objects(),
  { x: "region", y: "value", fill: "region", tip: true })
```

::step
Narrative for step 1 — reuses the section-level chart above.
::

::step
```plot
Plot.barY(aq.from(sources.housing).filter(d => d.region === "Inner").objects(),
  { x: "region", y: "value", fill: "region", tip: true })
```
Step 2 overrides with its own chart.
::
````

All code blocks receive these variables in scope:
- `sources` — the full map of loaded datasets (e.g. `sources.housing`)
- `data` — the section's own dataset array (empty when no `data:` key in section frontmatter)
- `aq`, `d3`, `Plot` — Arquero, D3, Observable Plot
- `step`, `section`, `dimensions`

The runtime infers `vis.type` from the first code block language found in any step (`plot`, `vega-lite`) — no `chart:` field needed in YAML.

For `vega-lite` steps, use a JS object expression `({ ... })` to access `sources`; pure JSON works when data is fully inline:
````md
::step
```vega-lite
({
  data: { values: sources.housing },
  mark: "bar",
  encoding: { x: { field: "region", type: "nominal" }, y: { field: "value", type: "quantitative" } }
})
```
::
````

### Adding a New Visualization

1. Create `src/visualizations/myChart.js` exporting `renderMyChart({ container, section, data })` returning `{ update, resize, destroy }`
2. Register it in `src/runtime/registerVisualizations.js`
3. Add the type string to `SUPPORTED_VIS` in `src/runtime/normalizeStory.js`

### CSS Architecture

- `src/styles/base.css` — resets and base typography
- `src/styles/layout.css` — section layout classes (`.section-shell`, `.section-scrolly`, etc.)
- `src/styles/scrolly.css` — scrolly-specific step and figure positioning
- `src/styles/threeToOne.css` — three-to-one editorial column rhythm
- `src/styles/custom.css` — user customization (referenced from `story.md`)

CSS custom properties set on `.app-shell` drive sizing:
- `--scrollytale-step-gap` — min height between steps
- `--scrollytale-figure-height` — sticky figure height
- `--scrollytale-figure-top` — sticky figure top offset
