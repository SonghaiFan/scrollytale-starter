# Scrollytale Syntax vNext

This document proposes a next-step authoring syntax for `scrollytale-starter`.

It is inspired by Slidev's Markdown-first authoring style, but it remains focused on scroll-driven narrative webpages instead of slides.

## Why Propose a New Syntax

The current `story.md` format works, but it is still too configuration-heavy.

Today the authoring experience is mostly:

- a section heading
- a large YAML block
- a little Markdown body

That means:

- Markdown is underused
- authors spend too much time inside config
- the file feels more like a schema than a story document
- AI tends to overproduce YAML instead of readable narrative structure

## Design Goals

The next syntax should:

1. stay Markdown-first
2. keep the starter friendly for both humans and AI
3. preserve data binding and layout control
4. support inline HTML naturally
5. feel closer to Slidev when writing
6. avoid adding a Vue dependency

## What We Want to Borrow from Slidev

Borrow the authoring ideas, not the slide model itself.

Good ideas to borrow:

- one primary Markdown entry file
- frontmatter-driven structure
- Markdown as the main writing surface
- support for inline HTML
- optional block syntax for structured content

Things we should not copy directly:

- slides as the core unit
- page-by-page presentation semantics
- Vue component dependency as the default extension mechanism

## Core Shift

### Current Model

Current format:

- top-level frontmatter
- `## Section`
- fenced `yaml` block
- optional Markdown

This is effectively YAML-first.

### Proposed Model

Proposed format:

- top-level frontmatter
- section separators
- short section frontmatter
- Markdown body as the main authoring space
- optional block directives for steps, visuals, and annotations

This is Markdown-first.

## Proposed File Shape

```md
---
title: Melbourne's Price Gap
data:
  sources:
    - id: housing_gap
      path: ./data/housing-gap.csv
custom_style: ./src/styles/custom.css
---

---
layout: hero
scene: focus
---

# Inner Melbourne stays ahead

A short introduction written as normal Markdown.

---
layout: scrolly-right
scene: guide
---

## The ranking is clear

The chart stays on screen while the text steps scroll.

::vis{type="bar" data="housing_gap" x="region" y="value"}
::

::step
Inner Melbourne sets the upper boundary.
::

::step
Middle suburbs sit clearly below the top tier.
::

::step
Outer suburbs remain lowest.
::
```

## Proposed Authoring Units

### 1. Global Frontmatter

Keep this as the global story config.

Use it for:

- `title`
- `structure`
- `data.sources`
- `custom_style`

This stays close to the current model.

### 2. Section Frontmatter

Each section begins with a short frontmatter block after a separator.

Recommended section-level fields:

- `layout`
- `scene`
- `transition`
- `action`
- optional `id`

Do not repeat low-value structure that can be inferred from the body.

### 3. Markdown Body

The body should carry most of the story.

Use normal Markdown for:

- headings
- paragraphs
- emphasis
- lists
- quotes
- links
- inline code

This keeps the file readable as a narrative document.

### 4. Inline HTML

Allow inline HTML directly in the Markdown body.

Example:

```md
<div class="callout">
  This is a custom editorial note.
</div>
```

This is one of the most useful things to borrow from Slidev-like authoring.

It makes the language much more expressive without requiring a framework-specific component layer.

### 5. Lightweight Block Directives

Instead of large YAML blobs, use short block directives when structure is needed.

Recommended first set:

- `::vis`
- `::step`
- `::annotation`

Example:

```md
::vis{type="line" data="housing_gap" x="year" y="value" series="region"}
::
```

```md
::step
All three lines rise across time.
::
```

```md
::annotation
The leader changes only if the data changes. The syntax should not imply extra chart logic.
::
```

## Proposed vNext Concepts

### Visual Binding

Move chart bindings into compact inline configuration:

```md
::vis{type="bar" data="housing_gap" x="region" y="value"}
::
```

This is easier to scan than a large YAML object.

### Step Content

Treat steps as body content, not as string arrays inside YAML.

Current:

```yaml
copy:
  steps:
    - "Inner first."
    - "Middle second."
    - "Outer third."
```

Proposed:

```md
::step
Inner first.
::

::step
Middle second.
::

::step
Outer third.
::
```

This feels much closer to authoring content directly.

### HTML Containers

If a section needs custom editorial markup, let it exist in the body.

Example:

```md
<div class="stat-grid">
  <div class="stat-card">Inner remains highest.</div>
  <div class="stat-card">Middle remains in between.</div>
  <div class="stat-card">Outer remains lowest.</div>
</div>
```

This removes pressure to encode everything as YAML.

## Comparison with the Current Syntax

### Current

Pros:

- explicit
- easy to validate
- easy to normalize

Cons:

- verbose
- less readable
- underuses Markdown
- weaker authoring feel

### Proposed

Pros:

- more natural to write
- more readable as a document
- more like editorial authoring
- easier to embed rich Markdown and HTML

Cons:

- parser becomes more complex
- directives need clear syntax rules
- validation becomes slightly less trivial

## Recommended Scope for vNext

Do not redesign everything at once.

Implement in phases.

### Phase 1

- keep global frontmatter
- add section separators with frontmatter
- support inline HTML
- support `::step`
- support `::vis`

### Phase 2

- support `::annotation`
- support nested content blocks
- support richer section metadata shorthand

### Phase 3

- consider optional reusable components
- consider author-defined blocks or plugins

## Migration Strategy

Do not break the current format immediately.

Recommended approach:

1. continue supporting the current YAML-first syntax
2. add a parser path for the new syntax
3. normalize both into the same internal story JSON
4. gradually move examples and docs to the new syntax

This gives the runtime one normalized model while allowing the authoring syntax to evolve.

## Parser Implication

The parser would need to understand:

- global frontmatter
- repeated section delimiters
- section frontmatter
- Markdown body blocks
- custom directives like `::step` and `::vis`

The important architectural idea is that:

- multiple authoring syntaxes can still map into one normalized story model

That means the renderer and visualizations do not need to care which syntax was used.

## Recommendation

Adopt a Markdown-first vNext syntax that:

- keeps frontmatter
- uses separators for sections
- allows inline HTML
- uses lightweight directives for visuals and scrolly steps

This would make `scrollytale-starter` feel much closer to Slidev in authoring experience, while still preserving the D3 scrollytelling runtime model.
