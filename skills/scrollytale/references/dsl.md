# Story DSL Reference

## File Structure

`story.md` has exactly two kinds of blocks:

1. **Global frontmatter** — the very first `---` block, story-level metadata
2. **Section blocks** — every subsequent `---` block starts a new section

---

## Global Frontmatter

```yaml
---
title: "Housing inequality in Melbourne"
data:
  sources:
    - id: housing
      path: ./data/housing.csv
    - id: weather
      path: ./data/weather.json
chrome:
  bottom_nav: true
  theme_toggle: true
custom_style: ./src/styles/custom.css
---
```

### Fields

| Field | Type | Description |
|---|---|---|
| `title` | string | Story title |
| `data.sources` | array | Named datasets. Each has `id` (used in code blocks) and `path` (relative to project root) |
| `chrome.bottom_nav` | boolean | Show the bottom navigation bar |
| `chrome.theme_toggle` | boolean | Show the light/dark theme toggle |
| `custom_style` | string | Optional extra CSS file path |

---

## Section Block

Each section starts with its own frontmatter, then a Markdown body.

````md
---
id: rent-pressure
layout: scrolly-right
---

## Rents rise unevenly across the city

Body prose renders as normal HTML (not a step card).

```plot
Plot.barY(sources.housing, { x: "suburb", y: "median_rent", fill: "region", tip: true })
```

::step
Inner suburbs rise first.
::

::step
```plot
Plot.barY(
  aq.from(sources.housing).filter(d => d.region === "Inner").objects(),
  { x: "suburb", y: "median_rent", fill: "region" }
)
```
Outer suburbs follow a different pattern.
::
````

### Section Frontmatter Fields

| Field | Required | Values | Description |
|---|---|---|---|
| `id` | yes | any slug | Stable machine-friendly identifier |
| `layout` | yes | see below | Visual arrangement of text and figure |
| `data` | no | source id string | Bind a dataset to this section's `data` variable |

### `layout` values

| Value | Description |
|---|---|
| `hero` | Full-bleed opening section, no figure |
| `chapter` | Plain narrative, no sticky figure |
| `scrolly-left` | Sticky figure on left, text scrolls on right |
| `scrolly-right` | Sticky figure on right, text scrolls on left |
| `scrolly-overlay` | Text floats over a full-bleed sticky figure |
| `full-width` | Figure spans full width below text |

---

## Charts — Code Blocks

Charts are defined by fenced code blocks with a language tag. No `::vis` directive needed.

### `plot` — Observable Plot

````md
```plot
Plot.barY(sources.housing, { x: "suburb", y: "median_rent", tip: true })
```
````

The expression must return one of:
- An Observable Plot mark (e.g. `Plot.barY(...)`) — the runtime calls `.plot(defaults)` on it
- A full Plot config object `{ marks: [...], ... }` — merged with layout defaults
- A DOM element — used as-is

### `vega-lite` — Vega-Lite spec

````md
```vega-lite
({
  mark: "bar",
  encoding: {
    x: { field: "suburb",      type: "nominal" },
    y: { field: "median_rent", type: "quantitative" }
  }
})
```
````

- Use a JS object expression `({ ... })` to access scope variables (e.g. `sources`)
- Pure JSON also works when data is fully inline
- `data` and `width`/`height` are injected automatically when omitted

### Scope variables available in every code block

| Variable | Type | Description |
|---|---|---|
| `sources` | object | All loaded datasets by id (e.g. `sources.housing`) — arrays of row objects |
| `data` | array | The section's own dataset (shortcut when `data:` is set in section frontmatter) |
| `Plot` | module | Observable Plot — `Plot.barY`, `Plot.lineY`, `Plot.dot`, etc. |
| `aq` | module | Arquero — `aq.from(sources.housing).filter(...).objects()` |
| `d3` | module | D3 — scales, formats, utilities |
| `step` | object | Current step object with any frontmatter fields (`step.focus`, `step.filter`, etc.) |
| `stepUtils` | object | Helpers: `stepUtils.focus(rows, { field })`, `stepUtils.filter(rows, { field })` |
| `section` | object | Normalized section model |
| `dimensions` | object | `{ width, height, margin: { top, right, bottom, left } }` — container size in px |

---

## Section-level vs Step-level Charts

A **section-level code block** sets the default chart for the whole section.
A **step-level code block** overrides it for that step only.
Steps with no code block reuse the section-level chart.

````md
---
id: example
layout: scrolly-right
---

```plot
// Section-level chart — used by all steps that don't define their own
Plot.barY(sources.housing, { x: "suburb", y: "median_rent" })
```

::step
Step 1 — reuses section chart above.
::

::step
```plot
// Step-level override — only for this step
Plot.barY(sources.housing, { x: "region", y: "median_rent", fill: "region" })
```
Step 2 shows aggregated view.
::
````

---

## Steps — `::step` Directive

Steps are the scroll-triggered cards in `scrolly-*` layouts. Each `::step` block is one card.

```md
::step
Short takeaway for this scroll position.
::
```

Steps can contain:
- Plain prose
- Markdown (headings, lists, links)
- A code block override (see above)
- YAML frontmatter for step-level fields like `focus` or `filter`

Step with frontmatter:

````md
::step
---
focus: "Inner"
---
Only Inner region is highlighted here.
::
````

The `focus` value is available as `step.focus` inside code blocks, and `stepUtils.focus(rows, { field: "region" })` uses it automatically.

---

## `::annotation` Directive

Parsed and stored but not rendered in the current runtime. Reserved for future use.

---

## Step ID Convention

Steps get auto-generated IDs: `{section-id}-step-1`, `{section-id}-step-2`, etc. These are used by the bottom navigation and the authoring panel.

---

## Minimal Working Example

````md
---
title: "Quick Demo"
data:
  sources:
    - id: cars
      path: ./data/cars.csv
chrome:
  bottom_nav: true
---

---
id: intro
layout: hero
---

## Cars of the World

A scrollytelling story about automobile data.

---
id: weight-vs-power
layout: scrolly-right
data: cars
---

## Weight vs. horsepower

```plot
Plot.dot(data, { x: "weight_in_lbs", y: "horsepower", fill: "origin", tip: true })
```

::step
Most American cars cluster at high weight and high horsepower.
::

::step
```plot
Plot.dot(
  data.filter(d => d.origin === "Europe"),
  { x: "weight_in_lbs", y: "horsepower", fill: "steelblue", tip: true }
)
```
European cars are lighter and more efficient.
::
````
