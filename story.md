---
title: "Melbourne Housing Snapshot"
chrome:
  bottom_nav: true
  theme_toggle: true
data:
  housing: ./data/demo.csv
custom_style: ./src/styles/custom.css
---

---
id: opening
layout: hero
dek: "A compacted scrollytelling starter that turns Markdown into a D3 narrative page."
---
# Where prices rise, pressure concentrates
This is astarter is moving closer to the original three-to-one editorial rhythm. Sections use frontmatter for layout, Markdown for narrative content, and lightweight directives for visuals and scrolly steps.

Scrolling to see how it workses.

---
id: region-comparison
layout: scrolly-right
---
## Inner Melbourne still leads on price
The chart stays visible while the text scrolls.

```plot
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

::step{focus="Inner"}
**Inner** Melbourne sets the upper boundary for the comparison.
::

::step{focus="Middle"}
**Middle** suburbs create the broadest spread in the middle of the ranking.
::

::step{focus="Outer"}
**Outer** suburbs remain lower, but not uniform.
::

---
id: trend-over-time
layout: scrolly-left
---
## The gap holds across the time series
The section body stays mostly normal Markdown.

::step{focus="all"}
```plot
Plot.line(aq.from(sources.housing).orderby("region", "year").objects(), {
  x: "year",
  y: "value",
  stroke: "region",
  strokeWidth: 2.5,
  tip: true
})
```
All three series move upward over time.
::

::step{filter="Inner"}
```plot
Plot.line(
  aq.from(sources.housing).filter(d => d.region === "Inner").orderby("year").objects(),
  { x: "year", y: "value", stroke: "region", strokeWidth: 2.5, tip: true }
)
```
The **Inner** region keeps the highest line throughout the series.
::

::step{filter="Outer,Middle"}
```plot
Plot.line(
  aq.from(sources.housing).filter(d => d.region !== "Inner").orderby("region", "year").objects(),
  { x: "year", y: "value", stroke: "region", strokeWidth: 2.5, tip: true }
)
```
The gap narrows slightly, but never closes between the lower two regions.
::

---
id: dot-comparison
layout: scrolly-right
---

## Each step defines its own Plot block

The visual state lives directly in each step as a code block. No chart type or field mapping in the YAML.

::step{focus="all"}
```plot
Plot.dot(aq.from(sources.housing).objects(), {
  x: "year",
  y: "value",
  stroke: "region",
  fill: "region",
  symbol: "square",
  r: 6,
  tip: true
})
```

All points remain visible so the three regional clusters are easy to compare.
::

::step{filter="Inner"}
```plot
Plot.dot(
  aq.from(sources.housing).filter((d) => d.region === "Inner").objects(),
  {
    x: "year",
    y: "value",
    fill: "region",
    symbol: "square",
    r: 7,
    tip: true
  }
)
```

The **Inner** region stays highest across the full set of years.
::

::step{filter="Outer,Middle"}
```plot
Plot.dot(
  aq.from(sources.housing).filter((d) => d.region !== "Inner").objects(),
  {
    x: "year",
    y: "value",
    stroke: "region",
    fill: "region",
    symbol: "square",
    r: 6,
    tip: true
  }
)
```

The lower two groups stay closer together, but they still separate over time.
::

---
id: vega-lite-comparison
layout: scrolly-left
---

## Steps can also swap native Vega-Lite specs

Each step defines a complete Vega-Lite spec. Data is provided explicitly via `sources`.

::step
```vega-lite
({
  data: { values: sources.housing },
  mark: { type: "bar", cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
  encoding: {
    x: { field: "region", type: "nominal", sort: "-y" },
    y: { field: "value", type: "quantitative" },
    color: { field: "region", type: "nominal", legend: null }
  }
})
```

The first step uses the full dataset as a compact bar comparison.
::

::step
```vega-lite
{
  "data": {
    "values": [
      {"region": "Inner", "value": 402},
      {"region": "Middle", "value": 326}
    ]
  },
  "mark": {"type": "bar", "cornerRadiusTopLeft": 3, "cornerRadiusTopRight": 3},
  "encoding": {
    "x": {"field": "region", "type": "nominal"},
    "y": {"field": "value", "type": "quantitative"},
    "color": {"field": "region", "type": "nominal", "legend": null}
  }
}
```

The second step swaps in a spec with inline data.
::

---
id: unit-view
layout: scrolly-overlay
---

## Overlay copy can travel over the figure

This section uses the overlay layout so the story text sits above the visual rather than beside it.

```plot
Plot.dot(sources.housing, {
  x: "year",
  y: "value",
  fill: "region",
  r: 7,
  tip: true
})
```

::step
The visual stays full and present behind the copy.
::

::step
Each step behaves like a translucent card over the chart.
::

::step
This gives the page a stronger editorial rhythm than a standard side-by-side layout.
::

---
id: unit-view-summary
---
## A chart can also live in a chapter section

```plot
Plot.plot({
  x: {
    axis: "top",
    grid: true,
    percent: true
  },
  marks: [
    Plot.ruleX([0]),
    Plot.barX(alphabet, {x: "frequency", y: "letter", sort: {y: "x", reverse: true}})
  ]
})
```

A body-level code block defines a static figure with no scrolly interaction.

---
id: closing
---

## Prompt plus CSV becomes a story spec

In the intended workflow, AI authors this file first, then the runtime turns it into a webpage. The same internal story model still powers rendering, but the authoring surface now feels much closer to writing a document.

![Calm shoreline](https://picsum.photos/1200/480?grayscale)
