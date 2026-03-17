# Story Format

`story.md` uses Markdown plus structured YAML blocks.

It has:

1. one global frontmatter block
2. one or more `## Section` headings
3. one fenced `yaml` block under each section heading
4. optional freeform Markdown after the block

## Global Frontmatter

```yaml
---
title: "Melbourne's Price Gap Holds Year After Year"
structure: linear
data:
  sources:
    - id: housing_gap
      path: ./data/housing-gap.csv
custom_style: ./src/styles/custom.css
---
```

### Supported Global Fields

- `title`
- `structure`
- `data.sources`
- `custom_style`

### `data.sources`

Each source needs:

- `id`: a short name used inside sections
- `path`: a path under `public/`, commonly `./data/your-file.csv`

## Section Structure

Example:

````md
## Trend
```yaml
id: trend
layout: scrolly-left
scene: observation
headline: "The same ordering survives over time"
dek: "The line chart shows movement, but not reversal."
action:
  trigger: step
transition:
  type: step
vis:
  type: line
  data:
    source: housing_gap
  fields:
    x: year
    y: value
    series: region
copy:
  steps:
    - "All three regions move upward from 2019 to 2022."
    - "The inner region remains the top line throughout the series."
    - "Middle and outer regions rise too, but they never catch the leader."
```

Optional body Markdown can go here.
````

## Supported v0 Fields

### `layout`

- `hero`
- `scrolly-left`
- `scrolly-right`
- `full-width`

### `scene`

- `focus`
- `guide`
- `observation`

### `action.trigger`

- `enter`
- `exit`
- `step`
- `scroll`

### `transition.type`

- `none`
- `step`
- `morph-lite`

### `vis.type`

- `html`
- `bar`
- `line`
- `unit`

## `vis.fields`

Typical mappings:

- `bar`
  - `x`: categorical field
  - `y`: numeric field
- `line`
  - `x`: date or ordered numeric field
  - `y`: numeric field
  - `series`: categorical field
- `unit`
  - `color`: categorical field

## `copy`

Use:

- `summary` for static or full-width sections
- `steps` for scrolly sections
- `annotations` for future extension

## Safe Authoring Rule

If a story can be expressed with:

- a supported layout
- a supported vis type
- real CSV column names

then it should usually be implemented by editing only `story.md`.
