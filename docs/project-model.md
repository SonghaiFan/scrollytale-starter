# Project Structure

This page explains where things live and what to edit.

## Top-Level Files

- `story.md`: main story source
- `package.json`: scripts and dependencies
- `vite.config.js`: dev/build configuration

## Data and Static Assets

- `public/data/`: local datasets (CSV/JSON)
- `public/`: static files served as-is

## Runtime Code

- `src/runtime/`: parse, normalize, render pipeline
- `src/layouts/`: section layouts (`hero`, `chapter`, `scrolly-*`)
- `src/visualizations/`: chart renderers
- `src/app/`: Vue app shell and UI components
- `src/styles/`: base and theme styles

## Docs

- `docs/index.md`: docs homepage
- `docs/authoring-workflow.md`: onboarding flow
- `docs/story-format.md`: syntax and examples
- `docs/design-space.md`: demo walkthrough

## What To Edit For Typical Work

For normal story production:

1. Edit `story.md`
2. Add data in `public/data/`
3. Adjust style in `src/styles/custom.css` if needed

Only change runtime files when adding new features.
