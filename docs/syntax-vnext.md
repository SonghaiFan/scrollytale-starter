# Authoring Recipes

Use this page for copy-paste patterns when building stories quickly.

## Recipe 1: Basic Bar Chart Section

````md
---
id: summary
layout: chapter
---

## Regional comparison

```plot
Plot.barY(sources.housing, {
  x: "region",
  y: "value",
  fill: "region",
  tip: true
})
```
````

## Recipe 2: Focus Interaction

```plot
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region")
    .rollup({ value: aq.op.sum("value") })
    .objects();

  return Plot.barY(
    stepUtils.focusBy("region", rows, { inactiveOpacity: 0.15 }),
    { x: "region", y: "value", fill: "region", ...stepUtils.opacityChannels(), tip: true }
  );
})()
```

## Recipe 3: Filter Interaction

```plot
Plot.line(
  stepUtils.filterBy(
    "region",
    aq.from(sources.housing).orderby("region", "year").objects()
  ),
  { x: "year", y: "value", stroke: "region", tip: true }
)
```

## Recipe 4: Scatter Plot with Tooltips

```plot
Plot.dot(sources.points, {
  x: "x",
  y: "y",
  fill: "category",
  r: 4,
  tip: true
})
```

## Recipe 5: Reusable Section-Level Chart

Define one section-level chart code block and reuse it across steps by adding narrative-only `::step` blocks.

## Recipe 6: Case-Insensitive Focus Values

Use exact values in `focus`, but remember `stepUtils` already handles case-insensitive matching by default.

## Troubleshooting Quick Checks

- Column names must match data exactly
- Null-heavy fields should be filtered before plotting
- Always run `npm run build` before sharing
