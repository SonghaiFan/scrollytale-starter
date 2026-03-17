# Scrollytale Starter

`scrollytale-starter` is a standalone project for building scroll-driven data stories with:

- one Markdown story file: `story.md`
- one or more CSV files in `public/data/`
- a small runtime that turns the story spec into a webpage

The core idea is simple:

1. write or generate `story.md`
2. point sections at real CSV fields
3. run the starter
4. get a scrollytelling webpage

This repo is designed for both humans and AI agents.

## If You Are New

- Read [authoring-workflow.md](authoring-workflow.md)
- Read [story-format.md](story-format.md)
- Open [`story.md`](../story.md)

## If You Are an AI Agent

Use this repo as the runtime and template layer.

Read in this order:

1. this page
2. [authoring-workflow.md](authoring-workflow.md)
3. [story-format.md](story-format.md)
4. [project-model.md](project-model.md)
5. the actual [`story.md`](../story.md)

Default behavior:

- edit `story.md`
- copy CSV files into `public/data`
- adjust `src/styles/custom.css` only when needed

Avoid changing runtime code unless the user explicitly asks for a new feature.

## What This Repo Is

This repo is:

- a standalone starter project
- a runtime for rendering a Markdown story spec
- a template that can be cloned and customized

This repo is not:

- a visual builder
- a general-purpose chart library
- a complete replacement for custom frontend work

## Current v0 Scope

- `structure`: `linear`
- `layout`: `hero`, `scrolly-left`, `scrolly-right`, `full-width`
- `vis.type`: `html`, `bar`, `line`, `unit`

## Related Concept: The Companion Skill

This starter is meant to work well with a separate AI authoring skill named `scrollytale`.

That skill helps an AI:

- clone this starter
- inspect CSV columns
- draft a story plan
- generate `story.md`

But the starter must remain usable on its own. Someone should be able to clone this repo and manually edit `story.md` without using any separate skill tooling.

## GitHub Pages

This `docs/` folder is intended to work as lightweight project documentation on GitHub and GitHub Pages.

If you enable GitHub Pages for this repository, set the source to:

- `Deploy from a branch`
- branch: `main`
- folder: `/docs`

Then this page becomes the main landing page for the project docs.
