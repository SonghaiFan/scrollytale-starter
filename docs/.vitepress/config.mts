import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Scrollytale Starter",
  description: "A standalone starter for Markdown-driven D3 scrollytelling.",
  base: "/scrollytale-starter/",
  cleanUrls: true,
  ignoreDeadLinks: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/authoring-workflow" },
      { text: "Story Format", link: "/story-format" },
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
});
