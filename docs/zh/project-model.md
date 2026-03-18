# 项目结构

本页说明项目目录该怎么用。

## 顶层文件

- `story.md`: 主故事文件
- `package.json`: 脚本和依赖
- `vite.config.js`: 开发和构建配置

## 数据与静态资源

- `public/data/`: 你的 CSV/JSON 数据
- `public/`: 其他静态文件

## Runtime 代码

- `src/runtime/`: 解析、归一化、渲染流程
- `src/layouts/`: 布局渲染器
- `src/visualizations/`: 图表渲染器
- `src/app/`: Vue 应用壳层和 UI
- `src/styles/`: 基础和主题样式

## 文档

- `docs/index.md`: 文档首页
- `docs/authoring-workflow.md`: 创作流程
- `docs/story-format.md`: 语法与示例
- `docs/design-space.md`: 示例演练

## 常规工作改哪些

普通故事任务通常只需：

1. 编辑 `story.md`
2. 在 `public/data/` 添加数据
3. 按需修改 `src/styles/custom.css`

只有在新增功能时才需要改 runtime。
