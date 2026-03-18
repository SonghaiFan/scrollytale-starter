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
id: chart-first-stage
layout: vis-container
chart: scatter
data: housing
x: year
y: value
color: region
dek: "Vis-container treats the chart as the main stage and lets the copy live inside that same field."
---

## The chart can become the main container

This section demos the new `vis-container` layout. Instead of placing text beside the visual, it lets the visual hold the stage and places the narrative as inset copy within it.

---
id: side-by-side-strip
layout: side-by-side
chart: bar
data: housing
x: region
y: value
dek: "Side-by-side arranges copy and chart along a single wide strip."
---

## The story can stretch sideways

This section demos the new `side-by-side` layout. It is the runtime strip preset we use while keeping the thesis term `Horizontal` reserved for chapter-level flow direction.

---
id: chapter-flow-horizontal
chapter:
  flow: horizontal
---

## Flow direction can live at chapter level

This section demos the new chapter-level flow syntax. `horizontal` is no longer a layout preset. It now lives under `chapter.flow`, so the thesis vocabulary stays semantic even before the runtime grows a full horizontal reading model.

---
id: chapter-flow-horizontal-second
layout: scrolly-bottom
chart: line
data: housing
x: year
y: value
series: region
dek: "Horizontal chapters can still carry step-based visual updates."
---

## The next section joins the same horizontal chapter

This panel belongs to the same horizontal chapter flow. It does not need to repeat `chapter.flow`, because the flow now carries forward until another section resets it.

::step{focus="all"}
All three series stay visible as the horizontal panel enters.
::

::step{focus="Inner"}
The **Inner** line takes focus in the middle of the horizontal panel.
::

::step{focus="Outer,Middle"}
The lower two lines become the focus before the chapter returns to vertical flow.
::

---
id: chapter-flow-reset
chapter:
  flow: vertical
---

## The chapter can return to vertical flow

This section resets the story back to vertical reading so the normal page rhythm resumes after the horizontal chapter sequence.

---
id: closing
---

## Prompt plus CSV becomes a story spec

In the intended workflow, AI authors this file first, then the runtime turns it into a webpage. The same internal story model still powers rendering, but the authoring surface now feels much closer to writing a document.

![Calm shoreline](https://picsum.photos/1200/480?grayscale)
