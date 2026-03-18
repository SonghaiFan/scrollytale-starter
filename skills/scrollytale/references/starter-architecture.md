# Starter Architecture Reference

## Intent

`scrollytale-starter` is the runtime that turns `story.md` into a scrollytelling webpage.

**Design rule: the starter should stay small, legible, and easy for AI to read and extend.**

The AI's primary job is to write `story.md`. Runtime code is only touched when a new feature
is explicitly requested.

---

## Repo Shape

```text
scrollytale-starter/
  package.json
  vite.config.js
  index.html
  story.md                        ← AI writes this
  public/
    data/                         ← CSV / JSON datasets go here
      demo.csv
      cars.csv
      ...
  skills/
    scrollytale/                  ← Agent skill definition
      SKILL.md
      references/
      assets/
      scripts/
  src/
    main.js                       ← Entry point — mounts Vue app
    app/
      App.vue                     ← Root component, owns all state
      StoryRuntime.vue            ← Vue wrapper around renderStory engine
      AuthoringPanel.vue          ← Side drawer editor (authoring mode)
      BottomNav.vue               ← Navigation bar
      AppModeSwitch.vue           ← Presenting / authoring toggle
      ThemeModeSwitch.vue         ← Light / dark toggle
      navMarkers.js               ← Maps vis types to nav dot shapes
      routes.js                   ← Simple path routing
    runtime/
      parseStory.js               ← Parses story.md into raw sections
      normalizeStory.js           ← Validates and normalizes to story model
      loadSources.js              ← Loads CSV/JSON via Arquero
      renderStory.js              ← Imperative engine: builds DOM, wires scrollama
      registerLayouts.js          ← Maps layout names → layout modules
      registerVisualizations.js   ← Maps vis type names → viz modules
    layouts/
      hero.js
      chapter.js
      scrollyLeft.js
      scrollyRight.js
      scrollyOverlay.js
      fullWidth.js
    visualizations/
      bar.js                      ← Observable Plot bar chart
      line.js                     ← Observable Plot line chart
      scatter.js                  ← Observable Plot scatter
      unit.js                     ← D3 unit / circle-packing chart
      html.js                     ← Raw HTML placeholder
      plotNative.js               ← Per-step `plot` code blocks
      vegaLiteNative.js           ← Per-step `vega-lite` code blocks
      shared.js                   ← Theme tokens, CSS var readers
      frameworkShared.js          ← Scope builder, dataset loader, dimension reader
    styles/
      base.css                    ← Resets, type scale, spacing tokens
      layout.css                  ← Section layout classes
      scrolly.css                 ← Step and figure positioning
      threeToOne.css              ← Editorial column rhythm, Plot theme tokens
      custom.css                  ← User overrides (referenced from story.md)
```

---

## Layer Responsibilities

### App shell (`src/app/`)

Vue SFCs manage state and routing. AI rarely touches these.

| File | Role |
|---|---|
| `App.vue` | Boots story, owns all reactive state |
| `StoryRuntime.vue` | Mounts/remounts the imperative render engine |
| `AuthoringPanel.vue` | Live editor drawer for `story.md` sections |
| `BottomNav.vue` | Section markers and scroll progress |
| `AppModeSwitch.vue` | Presenting ↔ authoring toggle |
| `ThemeModeSwitch.vue` | Light / dark theme toggle |

### Runtime utils (`src/runtime/`)

Pure JS functions. No framework. AI does not modify these unless adding a feature.

| File | Role |
|---|---|
| `parseStory.js` | `story.md` string → raw section array |
| `normalizeStory.js` | Raw sections → validated story model with warnings |
| `loadSources.js` | Fetch and parse CSV/JSON via Arquero |
| `renderStory.js` | Orchestrate layout + viz + scrollama for each section |
| `registerLayouts.js` | `{ "scrolly-right": renderScrollyRight, ... }` |
| `registerVisualizations.js` | `{ "bar": renderBar, "plot": renderPlotNative, ... }` |

### Layout modules (`src/layouts/`)

Each layout is a plain JS function:

```js
// Signature
function renderScrollyRight({ section, markdown }) {
  // Build DOM structure
  return { element, figure, steps };
  // element — the root section DOM node
  // figure  — the container where the viz will be mounted
  // steps   — array of .step DOM nodes for scrollama
}
```

Layouts only build HTML scaffolding. They do not touch data or charts.

### Visualization modules (`src/visualizations/`)

Each viz is a plain JS function that returns a controller:

```js
// Signature
function renderBar({ container, section, data, sources }) {
  // Mount initial chart into container
  return {
    update(payload) { /* re-render for new step */ },
    resize()        { /* re-render for new container size */ },
    destroy()       { /* clean up */ },
  };
}
```

The `{ update, resize, destroy }` contract is the only interface between the scroll engine
and the chart library. D3, Plot, and Vega all stay fully imperative inside these modules.

---

## Supported Layouts and Vis Types

### Layouts

| `layout` value | Module |
|---|---|
| `hero` | `layouts/hero.js` |
| `chapter` | `layouts/chapter.js` |
| `scrolly-left` | `layouts/scrollyLeft.js` |
| `scrolly-right` | `layouts/scrollyRight.js` |
| `scrolly-overlay` | `layouts/scrollyOverlay.js` |
| `full-width` | `layouts/fullWidth.js` |

### Vis types (inferred from code block language)

| Vis type | Module | How to use |
|---|---|---|
| `bar` | `visualizations/bar.js` | `::vis` field mappings in section frontmatter |
| `line` | `visualizations/line.js` | `::vis` field mappings in section frontmatter |
| `scatter` | `visualizations/scatter.js` | `::vis` field mappings |
| `unit` | `visualizations/unit.js` | `::vis` field mappings |
| `html` | `visualizations/html.js` | Raw HTML in section body |
| `plot` | `visualizations/plotNative.js` | `` ```plot `` code block |
| `vega-lite` | `visualizations/vegaLiteNative.js` | `` ```vega-lite `` code block |

For new stories, prefer `plot` or `vega-lite` — they are the most expressive and require
no runtime extension.

---

## Adding a New Visualization Type

Follow this 3-step recipe. Copy exactly — do not invent new patterns.

**Step 1** — create `src/visualizations/myChart.js`:

```js
import { getChartTheme } from "./shared.js";
import {
  getFrameworkDimensions,
  getFrameworkUpdatePayload,
  renderFrameworkError,
} from "./frameworkShared.js";

export function renderMyChart({ container, section, data, sources = {} }) {
  let currentIndex = 0;
  let currentStep  = null;

  function draw(payload) {
    const { index, step } = getFrameworkUpdatePayload(payload);
    const dimensions      = getFrameworkDimensions(container);
    const theme           = getChartTheme();

    currentIndex = index;
    currentStep  = step;

    try {
      // Build your chart here, append to container
    } catch (err) {
      renderFrameworkError(container, err instanceof Error ? err.message : String(err));
    }
  }

  draw(0);

  return {
    update(payload) { draw(payload); },
    resize()        { draw({ index: currentIndex, step: currentStep }); },
    destroy()       { container.innerHTML = ""; },
  };
}
```

**Step 2** — register in `src/runtime/registerVisualizations.js`:

```js
import { renderMyChart } from "../visualizations/myChart.js";
// add to the returned map:
"my-chart": renderMyChart,
```

**Step 3** — add to `SUPPORTED_VIS` in `src/runtime/normalizeStory.js`:

```js
const SUPPORTED_VIS = new Set([..., "my-chart"]);
```

---

## Data Flow Summary

```
story.md
  ↓ parseStory()         raw section array
  ↓ normalizeStory()     validated story model
  ↓ loadSources()        { housing: [...], cars: [...], ... }
  ↓ renderStory()
      for each section:
        layout.render()  → { element, figure, steps }
        viz.render()     → { update, resize, destroy }
        scrollama        → step enter → viz.update(payload)
```

---

## CSS Custom Properties

Observable Plot tokens (read by `shared.js` / `frameworkShared.js`):

```css
/* defined in src/styles/threeToOne.css */
--plot-font-family
--plot-font-size
--plot-margin-top / right / bottom / left   /* unitless integers */
--chart-series-1 … --chart-series-6         /* palette */
```

Layout sizing tokens (defined on `.vue-app-shell`):

```css
--scrollytale-step-gap        /* min height between steps */
--scrollytale-figure-height   /* sticky figure height */
--scrollytale-figure-top      /* sticky figure top offset */
```
