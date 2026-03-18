---
layout: home

hero:
  name: "Scrollytale Starter"
  text: "Build Scrollytelling Pages with Markdown"
  tagline: "Write one story file, connect your data, and ship a scroll-driven narrative."
  actions:
    - theme: brand
      text: Start Guide
      link: /authoring-workflow
    - theme: alt
      text: Story Format
      link: /story-format
    - theme: alt
      text: Demo Walkthrough
      link: /design-space

features:
  - title: Markdown First
    details: Keep narrative and chart code together in `story.md`.
  - title: Fast Local Workflow
    details: Edit, refresh, and iterate with Vite in seconds.
  - title: Built-in Layouts
    details: Use `hero`, `chapter`, `scrolly-left`, `scrolly-right`, `scrolly-overlay`, and `full-width`.
  - title: Built-in Data Helpers
    details: Use Plot, Arquero, and `stepUtils` for focus and filter interactions.
---

## What You Can Do

- Build a full scrollytelling page from one Markdown file
- Connect local CSV or JSON data
- Add step-by-step chart states with `::step`
- Publish as a static site

## 5-Minute Start

1. Install dependencies: `npm install`
2. Run locally: `npm run dev`
3. Open `story.md` and edit headline/body
4. Add or update a chart code block
5. Confirm build: `npm run build`

## Recommended Reading Order

1. [Authoring Workflow](authoring-workflow.md)
2. [Story Format](story-format.md)
3. [Demo Walkthrough](design-space.md)
4. [Project Structure](project-model.md)

## Where To Edit

- Content and chart logic: `story.md`
- Data files: `public/data/`
- Theme tweaks: `src/styles/custom.css`
