# Story Format

This page shows the recommended `story.md` format.

## 1. Global Frontmatter

At the top of `story.md`:

```yaml
---
title: "My Story"
data:
  housing: ./data/housing.csv
custom_style: ./src/styles/custom.css
chrome:
  bottom_nav: true
  theme_toggle: true
---
```

## 2. Section Block

Each section starts with frontmatter:

```md
---
id: trend
layout: scrolly-right
---
```

Then write normal Markdown body content.

## 3. Layout Options

Supported layouts:

- `chapter`
- `hero`
- `scrolly-left`
- `scrolly-right`
- `scrolly-overlay`
- `full-width`

If `layout` is omitted, the section behaves like `chapter`.

## 4. Plot Code Blocks

Use `plot` code blocks for charts.

```plot
Plot.barY(sources.housing, { x: "region", y: "value", fill: "region", tip: true })
```

Available variables inside code blocks:

- `Plot`
- `aq`
- `d3`
- `sources`
- `samples`
- `data`
- `step`
- `stepUtils`
- `section`
- `dimensions`

## 5. Step Blocks

Use `::step` in scrolly sections.

```md
::step
Narrative for this step.
::
```

You can add step intent values:

```md
::step{focus="all"}
Show all.
::

::step{focus="Inner"}
Highlight Inner.
::

::step{filter="Inner"}
Show only Inner.
::
```

## 6. stepUtils Helpers

Use these helpers to avoid repetitive parsing logic.

- `stepUtils.focus(rows, { field, inactiveOpacity, activeOpacity, opacityField })`
- `stepUtils.focusBy(field, rows, options)`
- `stepUtils.filter(rows, { field })`
- `stepUtils.filterBy(field, rows, options)`
- `stepUtils.opacityChannels(opacityField)`
- `stepUtils.values(intent)`

### Focus example

```plot
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region")
    .rollup({ value: aq.op.sum("value") })
    .objects();

  return Plot.barY(
    stepUtils.focusBy("region", rows, { inactiveOpacity: 0.15 }),
    {
      x: "region",
      y: "value",
      fill: "region",
      ...stepUtils.opacityChannels(),
      tip: true,
    }
  );
})()
```

### Filter example

```plot
Plot.line(
  stepUtils.filterBy(
    "region",
    aq.from(sources.housing).orderby("region", "year").objects()
  ),
  { x: "year", y: "value", stroke: "region", tip: true }
)
```

## 7. Vega-Lite Blocks

Use `vega-lite` code blocks when preferred:

```vega-lite
({
  data: { values: sources.housing },
  mark: "bar",
  encoding: {
    x: { field: "region", type: "nominal" },
    y: { field: "value", type: "quantitative" }
  }
})
```

## 8. Minimal Full Example

````md
---
title: "Housing Story"
data:
  housing: ./data/housing.csv
---

---
id: opening
layout: hero
---
# Housing pressure is rising

---
id: trend
layout: scrolly-right
---
## Inner region remains highest

```plot
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region", "year")
    .rollup({ value: aq.op.mean("value") })
    .objects();
  return Plot.line(rows, { x: "year", y: "value", stroke: "region", tip: true });
})()
```

::step{focus="all"}
All regions together.
::

::step{focus="Inner"}
Inner region highlighted.
::
````

## 9. Recommended Practice

- Keep one claim per step
- Keep section IDs stable
- Use exact column names from your CSV
- Run `npm run build` before sharing
