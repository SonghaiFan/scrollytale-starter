# Scrollytale

Scrollytale is an MDX application for scroll-driven VisDelta stories. Markdown carries the narrative; native JavaScript modules define chart states; React components own layouts and chart lifecycles.

This is a greenfield design. The previous frontmatter/`::step` format and D3 chart renderers have been removed.

## Start

```sh
npm ci
npm run dev
```

Read at `/`. Write at `/authoring`. Edit `story.mdx` and import states from ordinary project modules. The shipped story uses fictional inline data and demonstrates Line, Bar, Point and Unit.

- [Authoring workflow](./authoring.md)
- [Component API](./reference.md)
- [Architecture and verification](./architecture.md)
