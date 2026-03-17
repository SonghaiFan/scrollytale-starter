---
layout: home

hero:
  name: "Scrollytale Starter"
  text: "Markdown-driven D3 scrollytelling"
  tagline: "A standalone starter for turning story specs and CSV files into scroll-driven webpages."
  actions:
    - theme: brand
      text: Start Here
      link: /authoring-workflow
    - theme: alt
      text: View on GitHub
      link: https://github.com/SonghaiFan/scrollytale-starter
    - theme: alt
      text: 简体中文
      link: /zh/

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

The core idea is simple:

1. write or generate `story.md`
2. point sections at real CSV fields
3. run the starter
4. get a scrollytelling webpage

This repo is designed for both humans and AI agents.

## Quick Start

1. Read [authoring-workflow.md](authoring-workflow.md)
2. Read [story-format.md](story-format.md)
3. Open [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md)
4. Run `npm install && npm run dev`

## For AI Agents

Use this repo as the runtime and template layer.

Read in this order:

1. this page
2. [authoring-workflow.md](authoring-workflow.md)
3. [story-format.md](story-format.md)
4. [project-model.md](project-model.md)
5. the actual [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md)

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

## Companion Skill

This starter is meant to work well with a separate AI authoring skill named `scrollytale`.

That skill helps an AI:

- clone this starter
- inspect CSV columns
- draft a story plan
- generate `story.md`

But the starter must remain usable on its own. Someone should be able to clone this repo and manually edit `story.md` without using any separate skill tooling.

## Documentation Site

This documentation site is powered by VitePress and intended for:

- GitHub browsing
- GitHub Pages publishing
- onboarding for both humans and AI agents

To publish it, enable GitHub Pages in the repository and choose:

- Source: `GitHub Actions`
