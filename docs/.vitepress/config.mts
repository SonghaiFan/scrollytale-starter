import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Scrollytale Starter",
  description: "A clean starter for Markdown-driven scrollytelling.",
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
          { text: "Demo", link: "/demo-walkthrough" },
          { text: "Project Structure", link: "/project-model" },
          {
            text: "GitHub",
            link: "https://github.com/SonghaiFan/scrollytale-starter",
          },
        ],
        sidebar: [
          {
            text: "Get Started",
            items: [
              { text: "Overview", link: "/" },
              { text: "Authoring Workflow", link: "/authoring-workflow" },
              { text: "Story Format", link: "/story-format" },
              { text: "Demo Walkthrough", link: "/demo-walkthrough" },
              { text: "Project Structure", link: "/project-model" },
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
          message: "Built with VitePress.",
          copyright: "Scrollytale Starter",
        },
      },
    },
    zh: {
      label: "简体中文",
      lang: "zh-CN",
      link: "/zh/",
      title: "Scrollytale Starter",
      description: "一个清晰易用的 Markdown 滚动叙事 starter。",
      themeConfig: {
        nav: [
          { text: "指南", link: "/zh/authoring-workflow" },
          { text: "故事格式", link: "/zh/story-format" },
          { text: "示例", link: "/zh/demo-walkthrough" },
          { text: "项目结构", link: "/zh/project-model" },
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
              { text: "示例演练", link: "/zh/demo-walkthrough" },
              { text: "项目结构", link: "/zh/project-model" },
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
          message: "使用 VitePress 构建。",
          copyright: "Scrollytale Starter",
        },
      },
    },
  },
});
