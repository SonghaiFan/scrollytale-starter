# scrollytale-starter

A lightweight starter for Markdown-driven D3 scrollytelling.

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

## Edit It

- update `story.md`
- place CSV files in `public/data`
- adjust styles in `src/styles/custom.css`

## v0 Scope

- `structure`: `linear`
- `layout`: `hero`, `scrolly-left`, `scrolly-right`, `full-width`
- `vis.type`: `html`, `bar`, `line`, `unit`
