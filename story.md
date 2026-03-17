---
title: "Melbourne Housing Snapshot"
data:
  housing: ./data/demo.csv
custom_style: ./src/styles/custom.css
---

---
id: opening
layout: hero
dek: "A compact scrollytelling starter that turns Markdown into a D3 narrative page."
---

# Where prices rise, pressure concentrates

This starter now supports a more Markdown-first syntax. Sections use frontmatter for layout, Markdown for narrative content, and lightweight directives for visuals and scrolly steps.

<div class="figure-card">
  <p class="figure-kicker">Markdown-first</p>
  <p>You can now write rich copy and inline HTML directly in the story file instead of pushing everything into large YAML blocks.</p>
</div>

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

::step
**Inner** Melbourne sets the upper boundary for the comparison.
::

::step
**Middle** suburbs create the broadest spread in the middle of the ranking.
::

::step
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

::step
All three series move upward over time.
::

::step
The **Inner** region keeps the highest line throughout the series.
::

::step
The gap narrows slightly, but never closes.
::

---
id: unit-view
layout: full-width
chart: unit
data: housing
color: region
---

## Each row can also become a unit mark

The unit chart keeps row-level granularity and shows how a simple categorical palette can support a final section.

---
id: closing
layout: full-width
---

## Prompt plus CSV becomes a story spec

In the intended workflow, AI authors this file first, then the runtime turns it into a webpage. The same internal story model still powers rendering, but the authoring surface now feels much closer to writing a document.
