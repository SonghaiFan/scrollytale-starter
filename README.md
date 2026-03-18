# scrollytale-starter

A Markdown-first starter for building scroll-driven data stories.

## Quick Start

```bash
npm install
npm run dev
```

Open:

- Presenting mode: `http://localhost:5173/`
- Authoring mode: `http://localhost:5173/authoring`

## Build

```bash
npm run build
```

## Run Docs

```bash
npm run docs:dev
```

## Main Docs

- `docs/index.md`
- `docs/authoring-workflow.md`
- `docs/story-format.md`
- `docs/demo-walkthrough.md` (demo walkthrough)
- `docs/project-model.md` (project structure)

## Typical Workflow

1. Add data files in `public/data/`
2. Edit `story.md`
3. Run `npm run dev` and preview
4. Run `npm run build` before sharing

For most stories, you only need to edit:

- `story.md`
- `src/styles/custom.css`

## Project Layout

- `story.md`: main story source
- `public/data/`: local CSV/JSON files
- `src/layouts/`: section layout renderers
- `src/visualizations/`: chart renderers
- `src/runtime/`: parse/normalize/render pipeline
- `docs/`: user guide and demo docs

## License

MIT
