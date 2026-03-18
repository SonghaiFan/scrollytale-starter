---
name: scrollytale
description: Create D3 scrollytelling webpages from a natural-language brief and CSV data by cloning the scrollytale-starter project, authoring a Markdown plus YAML story DSL, and filling supported layouts and visualization specs. Use when building scroll-driven narrative data stories for non-coders collaborating with AI.
---

# Scrollytale

Create a scrollytelling project from a prompt and CSV data using the public starter repo `scrollytale-starter`.

## When to Use

- The user wants a D3 scrollytelling webpage
- The user has a CSV and a narrative idea
- The user wants AI to author a story spec instead of hand-coding the page
- The user wants a Markdown-driven workflow similar in spirit to Slidev

## Core Workflow

1. Clone the starter repo into the requested workspace.
2. Inspect the provided CSV columns and likely story angles.
3. Draft a linear story with 4 to 7 sections.
4. Write or update `story.md` using the Markdown-first DSL with section frontmatter and lightweight directives.
5. Keep the story within the v0 runtime capabilities.
6. Only modify runtime code if the user explicitly asks for new functionality.

Read the exact execution sequence in [workflow](references/workflow.md).

## Starter Repo

Use the public starter repo named `scrollytale-starter`.

Starter clone URL:

`https://github.com/SonghaiFan/scrollytale-starter.git`

## Output Rules

- The primary artifact is `story.md`
- Keep `structure: linear` unless the runtime explicitly supports more
- Prefer these layouts:
  - `hero`
  - `scrolly-left`
  - `scrolly-right`
  - `full-width`
- Prefer these vis types:
  - `bar`
  - `line`
  - `unit`
  - `html`
- Use `custom_style` only for light overrides

## Design-Space Mapping

Use the following fields as the stable authoring vocabulary:

- `structure`
- `layout`
- `scene`
- `transition`
- `action`

For v0, read the supported values in:

- [dsl reference](references/dsl.md)
- [starter architecture](references/starter-architecture.md)
- [workflow](references/workflow.md)

## Authoring Heuristics

- Start with one `hero` section that states the core claim
- Use 2 to 4 analytical sections in `scrolly-left` or `scrolly-right`
- End with a short synthesis section
- Bind one main message to each step
- Use one primary data source per section
- Prefer simple chart choices over ambitious but unsupported interactions

## Guardrails

- Do not invent runtime features that the starter does not support
- Do not overfit the story to every available CSV column
- Do not generate complex custom D3 code by default
- If the prompt asks for unsupported maps, sankeys, or branching structures, note the gap clearly and either simplify or ask before extending the runtime

## References

- DSL details: [references/dsl.md](references/dsl.md)
- Starter repo shape: [references/starter-architecture.md](references/starter-architecture.md)
- Authoring workflow: [references/workflow.md](references/workflow.md)
- Story template: [assets/story.template.md](assets/story.template.md)
- Story brief template: [assets/story-brief.template.md](assets/story-brief.template.md)
- CSV profiler: [scripts/profile_csv.py](scripts/profile_csv.py)
