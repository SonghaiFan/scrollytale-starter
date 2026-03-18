# Authoring Workflow

Use this exact flow when the user asks for a new scrollytelling project from a prompt and CSV.

## 1. Clone the Starter

Clone the public starter repo into the requested workspace:

```bash
git clone https://github.com/SonghaiFan/scrollytale-starter.git <project-name>
```

If the repo already exists locally, do not overwrite it. Work inside the existing clone.

## 2. Copy the Data

Place the user CSV in `public/data/`.

Recommended convention:

- keep the original filename when possible
- use a simple lowercase name with dashes

## 3. Profile the CSV

Run the helper script from this skill directory, or call it by absolute path:

```bash
python3 scripts/profile_csv.py /absolute/path/to/file.csv
```

The script returns:

- row count
- per-column inferred types
- sample values
- likely chart-field combinations
- rough story-angle suggestions

Use the output to choose fields that the current runtime already supports.

## 4. Draft a Story Brief

Before writing `story.md`, make a compact internal brief with:

- working title
- core claim
- data source id and path
- likely chart mappings
- 4 to 7 section outline

Use [assets/story-brief.template.md](../assets/story-brief.template.md).

Do not show the brief to the user unless it helps the conversation. It is a planning artifact.

## 5. Write `story.md`

Create or replace the starter's `story.md`.

Rules:

- keep `structure: linear`
- keep to supported layouts and vis types
- use section frontmatter plus Markdown body for new stories
- use `::vis` for built-in chart bindings
- use `::step` for scrolly step text
- prefer 1 hero, 2 to 4 analytical sections, 1 closing section
- keep all field names aligned with the real CSV columns

## 6. Keep Runtime Changes Minimal

Default behavior:

- edit `story.md`
- copy the CSV
- optionally edit `src/styles/custom.css`

Only change runtime code if the user explicitly asks for a new feature or the story cannot be expressed inside the v0 runtime.

## 7. Validate

Run:

```bash
npm install
npm run build
```

If build fails, fix the project before finishing.

## Field-Choice Heuristics

Use the profile output to make conservative choices:

- `bar`
  - `x`: categorical field
  - `y`: numeric field
- `line`
  - `x`: date or ordered numeric field
  - `y`: numeric field
  - `series`: optional categorical field
- `unit`
  - `color`: categorical field
- `html`
  - use when no built-in chart maps cleanly

## Scope Guardrails

If the user asks for unsupported behavior:

- simplify to supported layouts and vis types
- explain the limitation briefly
- only extend the runtime after explicit approval
