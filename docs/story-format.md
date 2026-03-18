# Story Format

`story.md` should feel like a story document, not a schema.

The default rule is simple:

- write normal Markdown
- use short frontmatter blocks for section setup
- use intuitive field names
- only reach for advanced metadata when you truly need it

## The Simplest Mental Model

Most stories only need three layers:

1. one top block for the page title and data files
2. one short block per section
3. normal Markdown for the actual writing

## Recommended Global Format

This is the easiest global shape to read and write:

```yaml
---
title: "Melbourne Housing Snapshot"
data:
  housing: ./data/demo.csv
custom_style: ./src/styles/custom.css
---
```

### Recommended Global Fields

- `title`
- `data`
- `custom_style`
- optional `chrome`

### `data`

The easiest data format is a simple map:

```yaml
data:
  housing: ./data/demo.csv
  rents: ./data/rents.csv
```

You can also still use the longer form:

```yaml
data:
  sources:
    - id: housing
      path: ./data/demo.csv
```

Both work.

### `chrome`

Page-level chrome stays intentionally small and intuitive.

Example:

```yaml
chrome:
  bottom_nav: true
```

Current supported chrome:

- `bottom_nav`
- `theme_toggle`

## Recommended Section Format

Each section starts with a short frontmatter block:

```md
---
id: trend
layout: scrolly-left
chart: line
data: housing
x: year
y: value
series: region
---
```

Then you write the body in plain Markdown.

For a normal narrative section, you can often omit `layout` entirely.

If a section has no special layout, the starter now treats it as a `chapter`.

## Example

````md
---
title: "Melbourne Housing Snapshot"
data:
  housing: ./data/demo.csv
---

---
id: opening
layout: hero
---

# Where prices rise, pressure concentrates

This page is written like a document, not like a config file.

---
id: trend
layout: scrolly-right
chart: line
data: housing
x: year
y: value
series: region
---

## The gap holds over time

The line chart stays visible while the text scrolls.

::step
All three series move upward over time.
::

::step
The inner region remains the top line throughout the series.
::
````

## Recommended Section Fields

These are the main fields most people should use:

- `id`
- `layout`
- `chart`
- `data`
- `x`
- `y`
- `series`
- `color`
- `headline`
- `dek`

If `headline` is omitted, the runtime uses the first Markdown heading in the section body.

## Recommended Layout Values

- `chapter`
- `hero`
- `scrolly-left`
- `scrolly-overlay`
- `scrolly-right`
- `full-width`

### `chapter`

`chapter` is the most natural narrative layout.

It is designed for:

- ordinary text sections
- Markdown-first writing
- optional embedded figures
- images directly inside the text flow

That means a simple section can look like:

````md
---
id: context
---

## Why the gap feels larger now

This is just a normal chapter-like section written in Markdown.
````

You can also insert images directly in the chapter body with normal Markdown:

````md
---
id: shoreline
---

## A chapter can carry inline media

The paragraph flow stays natural, and the image sits inside the story rather than in a separate visualization slot.

![Calm shoreline](https://picsum.photos/1200/480?grayscale)
````

## Recommended Chart Values

- `bar`
- `line`
- `scatter`
- `unit`
- `html`
- `plot`
- `vega-lite`

## `::step`

Use `::step` when a chart should stay in place while the text progresses.

```md
::step
Inner Melbourne sets the upper boundary for the comparison.
::
```

Each step can contain normal Markdown and an optional code block that defines the visual state for that step.

### Step keywords: `focus` and `filter`

Steps can carry one of two semantic keywords as a hint about the visual intent.
The keyword appears as an eyebrow label at the top of the step card and in the authoring panel.

| Keyword | Meaning | Code pattern |
|---|---|---|
| `focus` | Highlight a subset; keep others visible but muted | All data rendered, focused items at full opacity |
| `filter` | Show only the subset; remove everything else | Data pre-filtered before passing to the mark |

```md
::step{focus="all"}
All series stay visible together.
::

::step{focus="Inner"}
Inner is highlighted; other series remain at reduced opacity.
::

::step{filter="Inner"}
Only the Inner series is rendered.
::

::step{filter="Outer,Middle"}
Only Outer and Middle are rendered.
::
```

The keyword is a documentation hint and a UI label — it does not drive the renderer.
The actual visual comes from the code block inside the step.

### Code-writing guide

Use the keyword to decide how to write the code block:

**`focus`** — render all data, keep the focused category's color, mute all others with reduced opacity.
Read `step.focus` in the code block so the same block works for every step:

```plot
// Works for focus="Inner", focus="Middle", focus="all", or no focus
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region")
    .rollup({ value: aq.op.sum("value") })
    .orderby(aq.desc("value"))
    .objects();
  const focused = step?.focus && !/^(all|\*)$/i.test(step.focus)
    ? new Set(step.focus.split(",").map(s => s.trim()))
    : null;
  return Plot.barY(
    rows.map(d => ({ ...d, __opacity: !focused || focused.has(d.region) ? 1 : 0.2 })),
    { x: "region", y: "value", fill: "region", fillOpacity: "__opacity", tip: true }
  );
})()
```

**`filter`** — pre-filter the data so only the target rows are passed to the mark:

```plot
// filter="Inner": only Inner rows
Plot.line(
  aq.from(sources.housing).filter(d => d.region === "Inner").orderby("year").objects(),
  { x: "year", y: "value", stroke: "region", strokeWidth: 2.5, tip: true }
)
```

```plot
// filter="Outer,Middle": everything except Inner
Plot.line(
  aq.from(sources.housing).filter(d => d.region !== "Inner").orderby("region", "year").objects(),
  { x: "year", y: "value", stroke: "region", strokeWidth: 2.5, tip: true }
)
```

## Section-level code blocks and per-step overrides

The section body can hold a single code block that defines the **default chart** for the entire section.
Steps with no code block reuse it; steps that need a different visual include their own block.

````md
---
id: region-comparison
layout: scrolly-right
---

## Inner Melbourne still leads on price

The chart stays visible while the text scrolls.

```plot
Plot.barY(
  aq.from(sources.housing).groupby("region").rollup({ value: aq.op.sum("value") }).orderby(aq.desc("value")).objects(),
  { x: "region", y: "value", fill: "region", tip: true }
)
```

::step{focus="Inner"}
Narrative only — reuses the section-level chart above.
::

::step{filter="Inner"}
```plot
Plot.barY(
  aq.from(sources.housing).filter(d => d.region === "Inner").groupby("region").rollup({ value: aq.op.sum("value") }).objects(),
  { x: "region", y: "value", fill: "region", tip: true }
)
```
This step overrides the chart to show only Inner.
::
````

The section-level code block is extracted from the body prose and never rendered as visible Markdown.
Non-code body text (headings, paragraphs) renders as normal HTML — not as a step card.

## Code block scope

All `plot` and `vega-lite` code blocks receive these variables:

- `sources` — the full map of all loaded datasets (e.g. `sources.housing`)
- `data` — the section's own dataset array (empty when no `data:` key in section frontmatter)
- `aq` — Arquero for filtering, grouping, and reshaping
- `d3` — D3 utilities
- `Plot` — Observable Plot (in `plot` blocks)
- `step`, `section`, `dimensions`

Always reference data as `sources.housing` (or whichever key you declared in global `data:`).

For `vega-lite` blocks, use a JavaScript object expression `({ ... })` when you need to access `sources`.
Pure JSON works when data is fully inline:

````md
::step
```vega-lite
({
  data: { values: sources.housing },
  mark: { type: "bar" },
  encoding: {
    x: { field: "region", type: "nominal" },
    y: { field: "value", type: "quantitative" }
  }
})
```
::
````

For `plot`, the block can return:

- a Plot mark such as `Plot.dot(...)` or `Plot.line(...)`
- a full Plot config object `{ marks: [...], x: {...}, ... }`
- a DOM node returned by `Plot.plot(...)`

## Optional `::vis`

Most stories do not need `::vis`.

The short section fields above are usually enough. But `::vis` is still available when you want an explicit inline visual declaration:

```md
::vis{type="bar" data="housing" x="region" y="value"}
::
```

## Inline HTML

Inline HTML is allowed directly in the body:

```md
<div class="callout">
  This is a custom editorial note.
</div>
```

This keeps the file expressive without requiring a component framework.

## Advanced Fields

Some richer fields are still supported, including:

- `structure`
- `scene`
- `transition`
- `action`

These exist mainly for:

- AI reasoning
- future runtime features
- alignment with the thesis design space

Most authors should treat them as optional.

If you want to see that internal model, read [design-space.md](design-space.md).

## Safe Authoring Rule

If your story can be described with:

- a supported `layout`
- a supported `chart`
- real CSV column names

then it should usually be built by editing only `story.md`.

## Legacy Compatibility

The older YAML-heavy format is still supported, so existing stories do not need immediate migration.
