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

Each step can contain normal Markdown.

`::step` can also carry a small amount of chart state.

For example, `line` and `bar` currently support `focus`:

```md
::step{focus="all"}
All series stay visible together.
::

::step{focus="Inner"}
Focus the Inner series or bar.
::

::step{focus="Outer,Middle"}
Focus multiple series or categories together.
::
```

This is closer to how the case studies work:

- step text explains the narrative
- step attributes describe the visual state change

## Native Framework Blocks

If a section declares `chart: plot` or `chart: vega-lite`, each step can define the visual directly with a fenced code block.

Observable Plot example:

````md
---
id: native-plot
layout: scrolly-right
chart: plot
data: housing
---

## Plot block in step content

::step
```plot
Plot.dot(aq.from(data).objects(), {
  x: "year",
  y: "value",
  stroke: "region",
  tip: true
})
```

Show all points.
::
````

Vega-Lite example:

````md
---
id: native-vl
layout: scrolly-right
chart: vega-lite
data: housing
---

## Vega-Lite block in step content

::step
```vega-lite
{
  "mark": "bar",
  "encoding": {
    "x": {"field": "region", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"}
  }
}
```

Show the default bar chart.
::
````

For `plot`, the block can return:

- a Plot mark such as `Plot.dot(...)`
- a full Plot config object
- a DOM node returned by `Plot.plot(...)`

For `vega-lite`, the block can be:

- valid JSON
- a JavaScript object expression

If the Vega-Lite spec omits `data`, the starter automatically injects the section's loaded dataset as `values`.

Both native block types currently receive these variables:

- `data`: the loaded row array for the section
- `aq`: Arquero for filtering, grouping, and reshaping data
- `d3`: D3 utilities when needed
- `step`: the current step object
- `section`: the current section config
- `dimensions`: the current container width, height, and margins

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
