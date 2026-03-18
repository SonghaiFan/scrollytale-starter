# Authoring Workflow

This is the fastest way to create a new story.

## 1. Start the Project

```bash
npm install
npm run dev
```

Open:

- `http://localhost:5173/` (presenting)
- `http://localhost:5173/authoring` (authoring panel)

## 2. Add Data

Place your CSV files in `public/data/`.

Example:

```text
public/data/housing-gap.csv
```

Use simple filenames and keep them stable once referenced in `story.md`.

## 3. Edit `story.md`

`story.md` is the source of truth for the page.

You will usually change:

- story title
- data names and paths
- section frontmatter
- section order
- section copy
- chart fields such as `chart`, `data`, `x`, and `y`
- section layout choices

## 4. Validate

```bash
npm run build
```

A passing build is the minimum pre-share check.

## 5. Ship

Deploy `dist/` or host through your preferred static hosting platform.

## Common Editing Pattern

1. Draft section copy first
2. Add one chart code block per section
3. Add `::step` blocks only where interaction is needed
4. Keep each step focused on one narrative point

## What You Usually Do Not Need to Change

Leave runtime code untouched unless you need a new capability:

- `src/runtime/*`
- `src/layouts/*`
- `src/visualizations/*`
