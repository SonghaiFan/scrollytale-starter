# scrollytale-starter

A lightweight starter for Markdown-driven D3 scrollytelling.

This repo is meant to work in two ways:

- as a standalone project that anyone can clone and edit manually
- as the runtime/template layer used by an AI authoring skill

The app is now starting a gradual move toward a Vue-driven document experience:

- Vue owns the outer app shell and story boot flow
- the current D3 layouts and scroll runtime still render the page
- this keeps the starter stable while opening a path toward inspector and authoring UI

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

Use the app in two modes:

- presenting: `http://localhost:5173/`
- authoring: `http://localhost:5173/authoring`

## Run The Docs

```bash
npm install
npm run docs:dev
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
- extend Vue app-shell logic in `src/app/` as the authoring experience grows

## v0 Scope

- `structure`: `linear`
- `layout`: `hero`, `scrolly-left`, `scrolly-right`, `full-width`
- `vis.type`: `html`, `bar`, `line`, `unit`

## GitHub Pages

This repo now includes a VitePress docs site in `docs/`.

To publish it with GitHub Pages:

1. Open repository settings on GitHub
2. Go to `Pages`
3. Set source to `GitHub Actions`
