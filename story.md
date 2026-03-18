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

Scrolling to see how it works.

---
id: region-comparison
layout: scrolly-right
chart: bar
data: housing
x: region
y: value
dek: "Each step can shift emphasis while the chart remains in place."
---

## Inner Melbourne still leads on price

The chart stays visible while the text scrolls. In the simplest authoring mode, the binding can live directly in the section frontmatter.

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
chart: line
data: housing
x: year
y: value
series: region
---
## The gap holds across the time series

The line chart reads directly from the same CSV, but the section body stays mostly normal Markdown.

::step{focus="all"}
All three series move upward over time.
::

::step{focus="Inner"}
The **Inner** region keeps the highest line throughout the series.
::

::step{focus="Outer,Middle"}
The gap narrows slightly, but never closes between the lower two regions.
::

---
id: dot-comparison
layout: scrolly-right
chart: plot
data: housing
x: year
y: value
series: region
dek: "This section is wired to a native Observable Plot block defined directly inside each step."
---

## Steps can now define native Observable Plot blocks

This section uses the same dataset as the line chart, but the visual state now lives directly in each step as a Plot code block.

::step{focus="all"}
```plot
Plot.dot(aq.from(data).objects(), {
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

::step{focus="Inner"}
```plot
Plot.dot(
  aq.from(data).filter((d) => d.region === "Inner").objects(),
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

::step{focus="Outer,Middle"}
```plot
Plot.dot(
  aq.from(data).filter((d) => d.region !== "Inner").objects(),
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
chart: vega-lite
data: housing
dek: "The same step-driven pattern also works with Vega-Lite specs."
---

## Steps can also swap native Vega-Lite specs

This section shows the same idea with Vega-Lite. If a spec omits `data`, the starter injects the section dataset automatically.

::step
```vega-lite
{
  "mark": {"type": "bar", "cornerRadiusTopLeft": 3, "cornerRadiusTopRight": 3},
  "encoding": {
    "x": {"field": "region", "type": "nominal", "sort": "-y"},
    "y": {"field": "value", "type": "quantitative"},
    "color": {"field": "region", "type": "nominal", "legend": null}
  }
}
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

The second step swaps in a completely different Vega-Lite spec.
::

---
id: unit-view
layout: scrolly-overlay
chart: unit
data: housing
color: region
dek: "Overlay sections keep the figure behind the text, which gets us closer to the original three-to-one rhythm."
---

## Overlay copy can travel over the figure

This section uses the new overlay layout so the story text sits above the visual rather than beside it.

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
chart: unit
data: housing
color: region
---

## Each row can also become a unit mark

The unit chart keeps row-level granularity and shows how a simple categorical palette can support a final section.

---
id: closing
---

## Prompt plus CSV becomes a story spec

In the intended workflow, AI authors this file first, then the runtime turns it into a webpage. The same internal story model still powers rendering, but the authoring surface now feels much closer to writing a document.

![Calm shoreline](https://picsum.photos/1200/480?grayscale)
