# Project Model

This page explains how `scrollytale-starter` relates to the companion AI skill and how to maintain the project cleanly over time.

## Two Layers

The overall system has two layers:

1. `scrollytale-starter`
2. `scrollytale` skill

### Layer 1: Starter

The starter is the runtime.

It is responsible for:

- parsing `story.md`
- loading CSV data
- rendering layouts
- rendering built-in visualizations
- turning story structure into a webpage

### Layer 2: Skill

The skill is the authoring workflow.

It is responsible for:

- cloning the starter
- inspecting data
- planning the story
- generating or revising `story.md`

## Why This Split Matters

This split keeps the project maintainable.

If the runtime and the authoring workflow are mixed together too tightly:

- the starter becomes harder to understand
- manual users become blocked on AI tooling
- AI agents change more code than necessary

With the split:

- humans can use the starter directly
- AI can use the starter through the skill
- runtime work and authoring work can evolve separately

## Maintenance Rules

### When to Change `story.md`

Change `story.md` when you are:

- making a new story
- changing section copy
- remapping charts to different fields
- reordering or retitling sections

### When to Change `src/styles/custom.css`

Change `custom.css` when you are:

- adjusting spacing
- changing colors
- adding a small project-specific look

### When to Change Runtime Code

Change runtime code only when you need:

- a new layout
- a new vis type
- a new parser feature
- a new interaction pattern

Runtime changes usually happen in:

- `src/runtime/`
- `src/layouts/`
- `src/visualizations/`

## Advice for AI Agents

Default to the smallest useful change.

For a normal story task:

1. read these docs
2. inspect the CSV
3. edit `story.md`
4. run `npm run build`

Do not extend the runtime just because a more complex chart is possible.

## Advice for Maintainers

When adding features, keep the system stable in this order:

1. runtime stays understandable
2. `story.md` stays easy to author
3. the skill can still map prompts into supported structures

If a new runtime feature makes `story.md` much harder to read, it is probably too early or too complex for the starter.
