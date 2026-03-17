# scrollytale-starter

A lightweight starter for Markdown-driven D3 scrollytelling.

This repo is meant to work in two ways:

- as a standalone project that anyone can clone and edit manually
- as the runtime/template layer used by an AI authoring skill

## What It Does

- reads `story.md`
- parses section YAML blocks into a normalized story model
- loads CSV data sources
- renders a small set of scrollytelling layouts
- binds built-in D3 visualizations to each section

## Run It

```bash
npm install
npm run dev
```

## Start Here

- Project overview: [docs/index.md](docs/index.md)
- Authoring workflow: [docs/authoring-workflow.md](docs/authoring-workflow.md)
- Story DSL: [docs/story-format.md](docs/story-format.md)
- Starter vs skill: [docs/project-model.md](docs/project-model.md)

## Edit It

- update `story.md`
- place CSV files in `public/data`
- adjust styles in `src/styles/custom.css`

## v0 Scope

- `structure`: `linear`
- `layout`: `hero`, `scrolly-left`, `scrolly-right`, `full-width`
- `vis.type`: `html`, `bar`, `line`, `unit`

## GitHub Pages

This repo now includes a lightweight docs site in `docs/`.

To publish it with GitHub Pages:

1. Open repository settings on GitHub
2. Go to `Pages`
3. Set source to `Deploy from a branch`
4. Choose branch `main`
5. Choose folder `/docs`
