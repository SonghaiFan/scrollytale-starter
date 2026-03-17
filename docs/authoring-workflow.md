# Authoring Workflow

This is the standard workflow for creating a story in `scrollytale-starter`.

## 1. Clone the Starter

```bash
git clone https://github.com/SonghaiFan/scrollytale-starter.git
cd scrollytale-starter
```

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
- data source ids and paths
- section order
- section copy
- chart field mappings
- section layout choices

## 4. Run the Project

```bash
npm install
npm run dev
```

Then open the local Vite URL, usually:

- `http://localhost:5173`

## 5. Validate Before Sharing

```bash
npm run build
```

If the build passes, the story is structurally valid enough for the current starter runtime.

## Recommended Story Shape

For v0, prefer:

1. one `hero` opening
2. two to four analytical sections
3. one closing section

Good default section count:

- 4 to 6 sections

## Recommended Chart Choices

- Use `bar` for ranking or category comparison
- Use `line` for change over time
- Use `unit` for row-level presence or categorical grouping
- Use `html` when you want a placeholder container or custom embedded content

## What to Change First

If you are making a new story, start in this order:

1. update the top frontmatter in [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md)
2. replace section copy
3. update `vis.data.source`
4. update `vis.fields`
5. optionally refine `src/styles/custom.css`

## What Not to Change by Default

Do not change runtime files unless you need a new feature:

- `src/runtime/*`
- `src/layouts/*`
- `src/visualizations/*`

For many stories, editing only `story.md` and adding a CSV is enough.
