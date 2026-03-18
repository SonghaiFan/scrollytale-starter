# Layout Mapping

This page translates the thesis layout vocabulary into the current `scrollytale-starter` runtime.

It answers one practical question:

`When we say Horizontal / Float to text / Text over Vis, what does that mean in this project today?`

## Reading The Diagram

In the thesis layout diagram:

- green = `text`
- yellow = `visualisation`
- black arrows = main reading / motion direction
- black frame = the dominant container or stage

That means the layout row is not only about screen arrangement. It also describes:

- which element is dominant
- which element behaves like a container
- whether text and vis are side-by-side, stacked, or overlaid

## Mapping Table

| Thesis layout | What it means | Closest starter layout | Runtime status | Notes |
| --- | --- | --- | --- | --- |
| `Horizontal` | Text and vis are arranged along a horizontal strip | chapter flow metadata (`chapter.flow: horizontal`) plus the starter preset `side-by-side` | metadata / approximation | The thesis term stays semantic. The current wide strip runtime is named `side-by-side`. |
| `Float to text` | A vis floats beside the text flow | `scrolly-left`, `scrolly-right` | partial | This is the closest current match |
| `Text container` | Text is the main container and vis is embedded inside it | `chapter`, `full-width` | partial | Good for article-like sections with embedded media |
| `Text over Vis` | Text overlays the visual layer | `scrolly-overlay`, `hero` | supported / partial | `scrolly-overlay` is the clearest current version |
| `Vertical` | Text and vis stack vertically | chapter flow metadata (`chapter.flow: vertical`) plus `full-width` as a visual approximation | metadata / approximation | `Vertical` is now treated as flow semantics first, not as a preset name |
| `Fixed to text` | Vis stays anchored to the text rather than becoming the main container | `scrolly-left`, `scrolly-right` | partial | Close to current sticky scrolly behavior |
| `Vis container` | The visual is the main container and text is placed inside or against it | `vis-container` | supported | Implemented as a chart-first stage with inset copy |
| `Vis over Text` | Visual sits on top of the text layer | none | missing | Opposite of `Text over Vis`, still not modeled directly |

## Current Interpretation

The starter currently has seven useful runtime families:

- `side-by-side`
- `hero`
- `chapter`
- `full-width`
- `vis-container`
- `scrolly-left` / `scrolly-right`
- `scrolly-overlay`

These map back to the thesis design space like this:

### `side-by-side`

- closest thesis pattern: current starter approximation of `Horizontal`
- current reading: a broad side-by-side strip with copy and visual arranged along the x-axis
- marker rule: circle / vis marker when paired with a chart

### `hero`

- closest thesis pattern: `Text over Vis`
- current reading: a full-bleed editorial opening where text sits over a visual field
- marker rule: square / narrative marker

### `chapter`

- closest thesis pattern: `Text container`
- current reading: a Markdown-first article section that may optionally carry embedded media
- marker rule: square / narrative marker

### `full-width`

- closest thesis pattern: between `Text container` and `Vertical`
- current reading: a broad section where text and figure share a wide stage
- marker rule: square / narrative marker

### `scrolly-left` and `scrolly-right`

- closest thesis pattern: between `Float to text` and `Fixed to text`
- current reading: the classic sticky-vis + scrolling-copy section
- marker rule: circle / vis marker

### `scrolly-overlay`

- closest thesis pattern: `Text over Vis`
- current reading: the figure is the stage and text travels above it
- marker rule: circle / vis marker

### `vis-container`

- closest thesis pattern: `Vis container`
- current reading: the chart is the main stage and the text sits inside that stage as inset copy
- marker rule: circle / vis marker

## What Is Still Missing

The thesis layout space is richer than the current runtime.

The biggest missing areas are:

- `Horizontal`
- `Vis over Text`

These are not just visual variants. They imply different authoring and runtime behaviors.

For example:

- `Horizontal` suggests chapter-level flow semantics, or a different scroll / paging model
- `Vis over Text` suggests stronger visual dominance than the current overlay preset

## Recommended Runtime Priorities

If we expand the layout system, the best order is:

1. Make `chapter`, `hero`, and `full-width` explicitly documented as the square-marker narrative family.
2. Strengthen `scrolly-left`, `scrolly-right`, and `scrolly-overlay` as the circle-marker vis family.
3. Keep `horizontal / vertical` semantic as chapter flow metadata, then add runtime behavior when we are ready.
4. Add a true `vis-over-text` preset instead of only discussing it conceptually.

## Why This Mapping Matters

This translation layer helps us keep three things aligned:

- the thesis design language
- the runtime presets
- the future authoring syntax

It lets us stay intuitive in `story.md`, while still using the thesis as a rigorous internal model.
