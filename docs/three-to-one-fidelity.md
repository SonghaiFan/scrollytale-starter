# Three-to-One Fidelity Spec

This page defines what it means for `scrollytale-starter` to restore the look and feel of the `demo_three-to-one-main` case study with high fidelity.

It is not a generic style wishlist. It is a concrete restoration checklist for the first reference case.

## Goal

The goal is for a story written in `scrollytale-starter` to feel recognizably close to the original `three-to-one` demo in:

- layout rhythm
- editorial styling
- sticky behavior
- overlay behavior
- page chrome
- scroll pacing

## Reference Source

Primary reference files:

- [`demo_three-to-one-main/index.html`](https://github.com/SonghaiFan/scrollytale/blob/main/demo_three-to-one-main/index.html)
- [`demo_three-to-one-main/src/css/three-to-one.css`](https://github.com/SonghaiFan/scrollytale/blob/main/demo_three-to-one-main/src/css/three-to-one.css)

Starter adaptation layer:

- [`src/styles/threeToOne.css`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/src/styles/threeToOne.css)

## Fidelity Layers

### 1. Layout Fidelity

These are the spatial patterns that define the demo:

- `chapter` blocks between scrolly segments
- `hero intro` with full-width background image
- `scrolly side left`
- `scrolly side right`
- `scrolly overlay`
- `chapter + embedded media` between scrolly sections

Current starter support:

- `hero`: partial match
- `scrolly-left`: close
- `scrolly-right`: close
- `scrolly-overlay`: supported
- `full-width`: partial stand-in for chapter blocks

### 2. Theme Fidelity

These are the visual details that create the demo's identity:

- `Raleway` body typography
- `Roboto Mono` utility typography
- saturated blue and green accent colors
- transparent white panels over the page background
- thin black borders
- very light blur on panels
- minimal rounded corners
- big editorial hero title

Current starter support:

- font family: close
- color palette: close
- border style: close
- transparent step cards: close
- hero scale and spacing: partial

### 3. Interaction Fidelity

These behaviors contribute directly to the perceived quality:

- sticky figures that stay pinned through the step sequence
- step cards that fade from low opacity to active emphasis
- large step text blocks
- generous scroll spacing between active states
- overlay article panel that floats over the figure
- smooth but restrained transitions

Current starter support:

- sticky figure: supported
- `::step` pacing: supported
- active step state: supported
- overlay article behavior: missing
- scroll-linked chrome updates: missing

### 4. Chrome Fidelity

The demo also has page-level interface elements:

- intro theme toggle
- bottom fixed navigation
- previous / next controls
- dynamic chapter indicator
- scroll hint / mouse indicator

Current starter support:

- bottom fixed navigation: supported
- theme toggle: still developing
- scroll hint: still developing
- dynamic chapter indicator: partial through active bottom nav state

## Fidelity Checklist

## Must Match First

These should be treated as v1 fidelity blockers:

1. `chapter` presentation that feels like the original editorial sections
2. full-width intro with large title and scroll hint
3. transparent step cards with low-opacity inactive states
4. bottom fixed navigation bar

## Good To Match Next

These matter, but can follow after the core layout fidelity lands:

1. theme toggle
2. embedded chapter figures between scrolly modules
3. tooltip container system
4. dynamic chapter state in the bottom nav

## Nice To Have Later

These improve polish after the main layout system is stable:

1. exact animation timing parity
2. theme switching persistence
3. richer chapter anchors and jump logic

## Runtime Work Needed

To reach the first high-fidelity milestone, the starter likely needs these additions:

### New Layout Presets

- `scrolly-overlay`
- optional `chapter` alias for editorial full-width blocks

### New Page Chrome

- `bottom-nav`
- `scroll-hint`
- optional `theme-toggle`

### New Story Fields

These should stay intuitive and author-friendly:

```yaml
chrome:
  bottom_nav: true
  scroll_hint: true

theme: three-to-one
```

Potential section shape:

```yaml
layout: scrolly-overlay
chart: line
data: housing
```

### New Runtime Responsibility

The runtime will need to manage:

- chapter registration
- active section tracking
- bottom nav state
- overlay-specific spacing and pointer behavior

## What We Should Not Break

While improving fidelity, the starter should still preserve:

- the Markdown-first authoring model
- the simple `layout / chart / data / x / y` syntax
- the ability for AI to generate a story without touching runtime code for ordinary cases

High fidelity should come from better presets and better runtime primitives, not from making `story.md` harder to read.

## Suggested Implementation Order

1. Add `scrolly-overlay`
2. Add `bottom-nav` chrome
3. Add `theme: three-to-one` page-level preset
4. Improve hero intro spacing and scroll hint
5. Add chapter registration for nav state

## Definition Of Done

We can call the first fidelity milestone complete when:

1. a starter story can reproduce side-left, side-right, and overlay sections
2. the page includes a bottom fixed nav similar to the demo
3. the hero and step panels feel visually aligned with the original
4. the result is recognizably "three-to-one" without hand-written custom CSS for every page
