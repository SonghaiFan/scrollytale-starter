<div class="design-space-page">

<div class="design-space-panel design-space-hero">
  <p class="design-space-eyebrow">Scrollytelling design space</p>
  <h1>Design Space</h1>
  <p class="design-space-lead">A visual atlas for the thesis-backed patterns inside <code>scrollytale-starter</code>.</p>
  <div class="design-space-legend">
    <span class="design-space-token blue">Structure</span>
    <span class="design-space-token yellow">Layout</span>
    <span class="design-space-token green">Text</span>
    <span class="design-space-token red">Transition</span>
  </div>
  <p class="design-space-note"><strong>Advanced/internal page.</strong> For everyday authoring, start with <a href="./story-format">story-format.md</a>. This page helps the runtime and AI reason about stories more deeply.</p>
</div>

## Overview

<div class="design-space-panel design-space-figure-frame">

![Scrollytelling design space](/design-space/p2-design-space-main.png)

</div>

The source vocabulary comes from the thesis chapter on the scrollytelling design space and is organized into four dimensions:

- `Structure`
- `Layout`
- `Transition`
- `Action`

The copied icons live at:

- `public/design-space/icons/`
- `docs/public/design-space/icons/`

The runtime taxonomy lives in [`src/runtime/designSpace.js`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/src/runtime/designSpace.js).

<div class="design-space-grid design-space-grid-compact">
  <div class="design-space-card">
    <h3>Why this page exists</h3>
    <p>To keep the academic model inside the starter without forcing ordinary authors to learn the whole taxonomy first.</p>
  </div>
  <div class="design-space-card">
    <h3>What it powers</h3>
    <p>Docs, icon assets, normalized story metadata, AI prompting, and future runtime planning.</p>
  </div>
</div>

## How It Maps To `story.md`

The starter keeps the same Markdown-first authoring model, but it now accepts richer design-space metadata.

### Global Structure

You can still use the simple form:

```yaml
structure: linear
```

You can also use the richer academic form:

```yaml
structure:
  family: linear
  pattern: burger
```

Today the runtime still renders a linear DOM flow, but the extra pattern metadata is preserved for planning, AI prompting, and future runtime features.

### Section Layout

You can still use the simple preset:

```yaml
layout: scrolly-right
```

You can also attach design-space fields:

```yaml
layout:
  preset: scrolly-right
  axis: vertical
  binding: float-to-text
  container: vis-container
```

This lets `story.md` describe both the starter preset and the academic layout language at the same time.

### Scene, Segue, and Action

The thesis transition and action language now maps like this:

- `scene`: `focus`, `guide`, `granularity`, `observation`
- `transition.segue`: `point-to-line`, `line-to-area`, `morph`, `division-merge`, `pack-unpack`
- `action.trigger`: `enter`, `exit`, `step`, `scroll`
- `action.affordance`: `header`, `in-line`, `tooltip`

Example:

````md
---
title: "Rental pressure across Melbourne"
structure:
  family: linear
  pattern: burger
data:
  sources:
    - id: rents
      path: ./data/rents.csv
---

---
id: widening-gap
layout:
  preset: scrolly-right
  axis: vertical
  binding: float-to-text
  container: vis-container
scene: granularity
transition:
  type: step
  segue: morph
action:
  trigger: step
  affordance:
    - tooltip
---

## The gap becomes visible at suburb level

::vis{type="line" data="rents" x="year" y="value" series="region"}
::

::step
The metro average hides the largest gaps.
::

::step
At suburb level, the spread becomes much wider.
::
````

## Current Support Matrix

This page distinguishes three levels:

- <span class="status-pill supported">Supported</span>: runtime behavior exists now
- <span class="status-pill metadata">Metadata only</span>: accepted and normalized, but not yet rendered as first-class behavior
- <span class="status-pill developing">Still developing</span>: not yet implemented in the runtime

## Still Developing Highlights

<div class="design-space-grid">
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-header.png" alt="Header icon" /> Header navigation</h3>
    <span class="status-pill developing">Still developing</span>
    <p>Needed for non-linear story entry points and chapter jumps.</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-tooltip.png" alt="Tooltip icon" /> Tooltip system</h3>
    <span class="status-pill developing">Still developing</span>
    <p>Best implemented as a shared runtime component instead of one-off chart code.</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-in-line.png" alt="In-line icon" /> In-line controls</h3>
    <span class="status-pill developing">Still developing</span>
    <p>Useful for lightweight toggles and local exploration inside narrative paragraphs.</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-morph.png" alt="Morph icon" /> Segue transitions</h3>
    <span class="status-pill developing">Still developing</span>
    <p>`morph`, `point-to-line`, and `pack-unpack` still need reusable visual transition primitives.</p>
  </div>
</div>

### Structure

| Pattern | Status | Notes |
| --- | --- | --- |
| `linear` | `supported` | Default starter flow |
| `parallel`, `bypass`, `branch`, `merge` | `metadata` | Useful for authoring plans and future navigation work |

### Layout

| Preset / Pattern | Status | Notes |
| --- | --- | --- |
| `hero` | `supported` | Approximates an editorial opening |
| `scrolly-left` | `supported` | Sticky figure + text steps |
| `scrolly-right` | `supported` | Sticky figure + text steps |
| `full-width` | `supported` | Flow section without sticky scrolly |
| `scrolly-overlay` | <span class="status-pill developing">Still developing</span> | Needed to fully cover `three-to-one` and `Nick_2` |
| `axis`, `binding`, `container`, `overlap` metadata | `metadata` | Stored in normalized story objects |

### Transition

| Pattern | Status | Notes |
| --- | --- | --- |
| ![](/design-space/icons/p2-icon-focus.png) `focus` | `supported` | Scene label available now |
| ![](/design-space/icons/p2-icon-guide.png) `guide` | `supported` | Scene label available now |
| ![](/design-space/icons/p2-icon-granularity.png) `granularity` | `metadata` | Accepted in syntax and normalization |
| ![](/design-space/icons/p2-icon-observation.png) `observation` | `supported` | Scene label available now |
| ![](/design-space/icons/p2-icon-point-to-line.png) `point-to-line` | `metadata` | Needs reusable vis transition primitives |
| ![](/design-space/icons/p2-icon-line-to-area.png) `line-to-area` | `metadata` | Same as above |
| ![](/design-space/icons/p2-icon-morph.png) `morph` | `metadata` | Same as above |
| ![](/design-space/icons/p2-icon-merge.png) `division-merge` | `metadata` | Same as above |
| ![](/design-space/icons/p2-icon-unpack.png) `pack-unpack` | `metadata` | Same as above |

### Action

| Pattern | Status | Notes |
| --- | --- | --- |
| ![](/design-space/icons/p2-icon-enter.png) `enter` | `metadata` | Accepted in syntax, lifecycle hooks still thin |
| ![](/design-space/icons/p2-icon-exit.png) `exit` | `metadata` | Same as above |
| ![](/design-space/icons/p2-icon-step.png) `step` | `supported` | Already wired via `::step` + Scrollama |
| ![](/design-space/icons/p2-icon-scroll.png) `scroll` | `supported` | Default scrolly motion model |
| ![](/design-space/icons/p2-icon-header.png) `header` | <span class="status-pill developing">Still developing</span> | Needed for non-linear navigation |
| ![](/design-space/icons/p2-icon-in-line.png) `in-line` | <span class="status-pill developing">Still developing</span> | Best added as embedded controls or toggles |
| ![](/design-space/icons/p2-icon-tooltip.png) `tooltip` | <span class="status-pill developing">Still developing</span> | Good candidate for shared runtime component |

## Why This Matters

This gives the project a shared language across:

- thesis writing
- case-study analysis
- `story.md` authoring
- AI prompting
- future runtime planning

The starter no longer has to choose between being academic or practical. The design space now acts as a bridge between the two.

## Recommended Next Runtime Steps

1. Add `scrolly-overlay` as the next layout preset.
2. Turn `transition.segue` into reusable vis controllers instead of metadata only.
3. Add shared `tooltip` and `header` components so non-linear structures can become real runtime features.

</div>
