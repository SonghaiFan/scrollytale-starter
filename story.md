---
title: "Melbourne Housing Snapshot"
structure: linear
data:
  sources:
    - id: housing
      path: ./data/demo.csv
custom_style: ./src/styles/custom.css
---

## Opening
```yaml
id: opening
layout: hero
scene: focus
headline: "Where prices rise, pressure concentrates"
dek: "A compact scrollytelling starter that turns Markdown into a D3 narrative page."
action:
  trigger: enter
transition:
  type: none
vis:
  type: html
copy:
  summary: "This starter keeps the first pass simple: one story file, a few layouts, and a small set of built-in charts."
```

This section uses the `hero` layout to introduce the main claim before the analytical sections begin.

## Region Comparison
```yaml
id: region-comparison
layout: scrolly-right
scene: guide
headline: "Inner Melbourne still leads on price"
dek: "Each step can shift emphasis while the chart remains in place."
action:
  trigger: step
transition:
  type: step
vis:
  type: bar
  data:
    source: housing
  fields:
    x: region
    y: value
copy:
  steps:
    - "The inner region begins at the top of the ranking."
    - "Middle suburbs create the broadest spread."
    - "Outer suburbs remain lower, but not uniform."
```

## Trend Over Time
```yaml
id: trend-over-time
layout: scrolly-left
scene: observation
headline: "The gap holds across the time series"
action:
  trigger: step
transition:
  type: step
vis:
  type: line
  data:
    source: housing
  fields:
    x: year
    y: value
    series: region
copy:
  steps:
    - "All three series move upward over time."
    - "The inner region keeps the highest line."
    - "The gap narrows slightly, but never closes."
```

## Unit View
```yaml
id: unit-view
layout: full-width
scene: focus
headline: "Each row can also become a unit mark"
action:
  trigger: scroll
transition:
  type: none
vis:
  type: unit
  data:
    source: housing
  fields:
    color: region
copy:
  summary: "The unit chart keeps row-level granularity and shows how a simple categorical palette can support a final section."
```

## Closing
```yaml
id: closing
layout: full-width
scene: observation
headline: "Prompt plus CSV becomes a story spec"
action:
  trigger: enter
transition:
  type: none
vis:
  type: html
copy:
  summary: "In the intended workflow, AI authors this file first, then the runtime turns it into a webpage."
```

