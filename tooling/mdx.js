import remarkGfm from 'remark-gfm';

// One configuration for Vite, docs, preview validation, save validation and tests.
export const mdxOptions = {
  jsxImportSource: 'react',
  development: false,
  remarkPlugins: [remarkGfm],
};
