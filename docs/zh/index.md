---
layout: home

hero:
  name: "Scrollytale Starter"
  text: "用 Markdown 快速制作滚动叙事页面"
  tagline: "一份 story.md，连接数据，生成可发布的 scrollytelling 页面。"
  actions:
    - theme: brand
      text: 开始指南
      link: /zh/authoring-workflow
    - theme: alt
      text: 故事格式
      link: /zh/story-format
    - theme: alt
      text: 示例演练
      link: /zh/design-space

features:
  - title: Markdown First
    details: 文案和图表代码都放在 story.md，便于维护。
  - title: 本地开发快
    details: 用 Vite 实时预览，编辑后立即看到结果。
  - title: 内置布局
    details: 支持 hero、chapter、scrolly-left、scrolly-right、scrolly-overlay、full-width。
  - title: 内置辅助
    details: 提供 Plot、Arquero 和 stepUtils，快速实现 focus/filter 交互。
---

## 你可以做什么

- 用一个 Markdown 文件做完整滚动叙事页
- 连接本地 CSV/JSON 数据
- 用 `::step` 制作分步图表叙事
- 构建并发布静态站点

## 5 分钟上手

1. 安装依赖：`npm install`
2. 本地运行：`npm run dev`
3. 打开并修改 `story.md`
4. 运行 `npm run build` 验证

## 推荐阅读顺序

1. [创作流程](authoring-workflow.md)
2. [故事格式](story-format.md)
3. [示例演练](design-space.md)
4. [项目结构](project-model.md)
