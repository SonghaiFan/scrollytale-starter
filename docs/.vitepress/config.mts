import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Scrollytale Starter",
  description: "A standalone starter for Markdown-driven D3 scrollytelling.",
  base: "/scrollytale-starter/",
  cleanUrls: true,
  ignoreDeadLinks: true,
  locales: {
    root: {
      label: "English",
      lang: "en",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/authoring-workflow" },
          { text: "Story Format", link: "/story-format" },
          { text: "Three-to-One Fidelity", link: "/three-to-one-fidelity" },
          { text: "Design Space", link: "/design-space" },
          { text: "Layout Mapping", link: "/layout-mapping" },
          { text: "Syntax vNext", link: "/syntax-vnext" },
          { text: "Project Model", link: "/project-model" },
          {
            text: "GitHub",
            link: "https://github.com/SonghaiFan/scrollytale-starter",
          },
        ],
        sidebar: [
          {
            text: "Getting Started",
            items: [
              { text: "Overview", link: "/" },
              { text: "Authoring Workflow", link: "/authoring-workflow" },
              { text: "Story Format", link: "/story-format" },
              { text: "Three-to-One Fidelity", link: "/three-to-one-fidelity" },
              { text: "Design Space", link: "/design-space" },
              { text: "Layout Mapping", link: "/layout-mapping" },
              { text: "Syntax vNext", link: "/syntax-vnext" },
              { text: "Project Model", link: "/project-model" },
            ],
          },
        ],
        search: {
          provider: "local",
        },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/SonghaiFan/scrollytale-starter",
          },
        ],
        footer: {
          message: "Built with VitePress for humans and AI agents.",
          copyright: "Scrollytale Starter",
        },
      },
    },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
      title: "Scrollytale Starter",
      description: "一个基于 Markdown 驱动的 D3 scrollytelling 独立 starter。",
      themeConfig: {
        nav: [
          { text: "指南", link: "/zh/authoring-workflow" },
          { text: "故事格式", link: "/zh/story-format" },
          { text: "Three-to-One 还原", link: "/zh/three-to-one-fidelity" },
          { text: "设计空间", link: "/zh/design-space" },
          { text: "Layout 映射", link: "/zh/layout-mapping" },
          { text: "下一代语法", link: "/zh/syntax-vnext" },
          { text: "项目模型", link: "/zh/project-model" },
          {
            text: "GitHub",
            link: "https://github.com/SonghaiFan/scrollytale-starter",
          },
        ],
        sidebar: [
          {
            text: "开始使用",
            items: [
              { text: "概览", link: "/zh/" },
              { text: "创作流程", link: "/zh/authoring-workflow" },
              { text: "故事格式", link: "/zh/story-format" },
              { text: "Three-to-One 还原", link: "/zh/three-to-one-fidelity" },
              { text: "设计空间", link: "/zh/design-space" },
              { text: "Layout 映射", link: "/zh/layout-mapping" },
              { text: "下一代语法", link: "/zh/syntax-vnext" },
              { text: "项目模型", link: "/zh/project-model" },
            ],
          },
        ],
        search: {
          provider: "local",
        },
        socialLinks: [
          {
            icon: "github",
            link: "https://github.com/SonghaiFan/scrollytale-starter",
          },
        ],
        footer: {
          message: "使用 VitePress 构建，服务于人和 AI agent。",
          copyright: "Scrollytale Starter",
        },
      },
    },
  },
});
