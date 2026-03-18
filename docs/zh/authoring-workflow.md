# 创作流程

这是最快的新故事制作流程。

## 1. 启动项目

```bash
npm install
npm run dev
```

打开：

- `http://localhost:5173/`（展示模式）
- `http://localhost:5173/authoring`（创作面板）

## 2. 准备数据

把数据文件放到 `public/data/`。

例如：

```text
public/data/my-data.csv
```

## 3. 编辑 story.md

大多数工作都在 `story.md`：

- 标题与全局设置
- section 顺序与 layout
- 文案与标题
- 图表代码
- `::step` 分步叙事

## 4. 验证

```bash
npm run build
```

构建通过后再分享。

## 5. 发布

发布 `dist/` 到静态托管平台即可。

## 常见编辑顺序

1. 先写 section 文案
2. 每个 section 加一个图表 code block
3. 只在需要交互时添加 `::step`
4. 每个 step 只表达一个观点

## 默认不需要改动

除非要新增能力，否则不建议先改 runtime：

- `src/runtime/*`
- `src/layouts/*`
- `src/visualizations/*`
