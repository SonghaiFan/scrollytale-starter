import remarkGfm from "remark-gfm";

// One configuration for Vite, docs, preview validation, save validation and tests.
export const mdxOptions = {
  jsxImportSource: "react",
  development: false,
  remarkPlugins: [remarkGfm],
};

// Only story documents receive narrative defaults; docs stay lightweight.
export const storyMdxOptions = {
  ...mdxOptions,
  providerImportSource: "/src/mdx-components.jsx",
};
