---
layout: home

hero:
  name: "Scrollytale Starter"
  text: "Markdown-driven D3 scrollytelling"
  tagline: "A standalone starter project for turning story specs and CSV files into scroll-driven webpages."
  actions:
    - theme: brand
      text: Start Here
      link: /authoring-workflow
    - theme: alt
      text: View on GitHub
      link: https://github.com/SonghaiFan/scrollytale-starter

features:
  - title: Standalone by default
    details: Clone the repo, edit `story.md`, add a CSV in `public/data`, and render a working scrollytelling page.
  - title: AI-friendly authoring
    details: The project is structured so humans and AI agents can both understand the authoring rules and make small, safe changes.
  - title: Clear split of concerns
    details: The starter is the runtime. A separate `scrollytale` skill can help generate `story.md`, but the starter remains usable on its own.
---

## What It Is

`scrollytale-starter` is a standalone project for building scroll-driven data stories with:

- one Markdown story file: `story.md`
- one or more CSV files in `public/data/`
- a small runtime that turns the story spec into a webpage

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

This docs site is configured for VitePress and GitHub Pages via GitHub Actions.

After enabling Pages in the repository settings, choose:

- Source: `GitHub Actions`
