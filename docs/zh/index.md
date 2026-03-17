---
layout: home

hero:
  name: "Scrollytale Starter"
  text: "基于 Markdown 的 D3 scrollytelling"
  tagline: "一个将故事规格与 CSV 渲染为滚动叙事网页的独立 starter。"
  actions:
    - theme: brand
      text: 从这里开始
      link: /zh/authoring-workflow
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/SonghaiFan/scrollytale-starter
    - theme: alt
      text: English
      link: /

features:
  - title: 默认独立可用
    details: 克隆仓库、修改 `story.md`、放入 `public/data` 中的 CSV，即可生成可运行的滚动叙事页面。
  - title: 面向 AI 的创作流程
    details: 项目结构同时适合人和 AI agent 阅读与修改，鼓励小而安全的改动。
  - title: 清晰分层
    details: starter 是 runtime，独立的 `scrollytale` skill 可以帮助生成 `story.md`，但 starter 本身始终可以单独使用。
---

## 项目是什么

`scrollytale-starter` 是一个独立项目，用来构建基于滚动叙事的数据故事页面。它包含：

- 一个 Markdown 故事文件：`story.md`
- 一个或多个放在 `public/data/` 里的 CSV
- 一个把故事规格渲染成网页的小型 runtime

它的核心思路很简单：

1. 编写或生成 `story.md`
2. 把 section 绑定到真实 CSV 字段
3. 运行 starter
4. 得到 scrollytelling 网页

这个仓库既是给人用的，也是给 AI agent 用的。

## 快速开始

1. 阅读 [authoring-workflow.md](authoring-workflow.md)
2. 阅读 [story-format.md](story-format.md)
3. 打开 [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md)
4. 运行 `npm install && npm run dev`

## 给 AI Agent 的说明

把这个仓库当作 runtime 和 template 层来使用。

建议按这个顺序阅读：

1. 当前页面
2. [authoring-workflow.md](authoring-workflow.md)
3. [story-format.md](story-format.md)
4. [project-model.md](project-model.md)
5. 实际的 [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md)

默认行为：

- 编辑 `story.md`
- 把 CSV 放到 `public/data`
- 只有在必要时才修改 `src/styles/custom.css`

除非用户明确要求新功能，否则不要主动修改 runtime 代码。

## 这个仓库是什么

这个仓库是：

- 一个可以直接 clone 使用的 starter 项目
- 一个把 Markdown 故事规格渲染成网页的 runtime
- 一个可以按项目需求继续定制的模板

这个仓库不是：

- 可视化拖拽编辑器
- 通用图表库
- 对复杂定制前端工作的完全替代

## 当前 v0 范围

- `structure`：`linear`
- `layout`：`hero`、`scrolly-left`、`scrolly-right`、`full-width`
- `vis.type`：`html`、`bar`、`line`、`unit`

## 配套 Skill

这个 starter 被设计为能和独立的 AI 创作 skill `scrollytale` 配合使用。

这个 skill 可以帮助 AI：

- clone 当前 starter
- 分析 CSV 列结构
- 起草故事计划
- 生成 `story.md`

但 starter 本身必须保持独立可用。也就是说，即使不使用 skill，任何人也应该能直接 clone 仓库并手工编辑 `story.md`。

## 文档站说明

这个文档站基于 VitePress，适合用于：

- 在 GitHub 中直接浏览
- 通过 GitHub Pages 发布项目文档
- 为人和 AI agent 提供统一入口

要发布它，只需要在仓库里开启 GitHub Pages，并选择：

- Source：`GitHub Actions`
