# 创作流程

这是在 `scrollytale-starter` 中创建故事的标准流程。

## 1. Clone Starter

```bash
git clone https://github.com/SonghaiFan/scrollytale-starter.git
cd scrollytale-starter
```

## 2. 添加数据

把你的 CSV 文件放进 `public/data/`。

例如：

```text
public/data/housing-gap.csv
```

文件名尽量保持简单，并在写入 `story.md` 后保持稳定。

## 3. 编辑 `story.md`

`story.md` 是页面的唯一事实来源。

你通常会修改：

- 故事标题
- data source 的 id 和 path
- section 顺序
- section 文案
- 图表字段映射
- section 的 layout 选择

## 4. 运行项目

```bash
npm install
npm run dev
```

然后打开本地 Vite 地址，通常是：

- `http://localhost:5173`

## 5. 分享前先验证

```bash
npm run build
```

如果 build 通过，说明这个故事至少对当前 starter runtime 来说是结构有效的。

## 推荐的故事结构

对 v0 来说，建议：

1. 一个 `hero` 开场
2. 两到四个分析 section
3. 一个结尾 section

合适的 section 数量通常是：

- 4 到 6 个

## 推荐图表选择

- `bar`：适合排序或分类比较
- `line`：适合时间变化
- `unit`：适合逐条记录或分类分组
- `html`：适合占位容器或自定义嵌入内容

## 最先该改什么

如果你在做一个新故事，建议按这个顺序开始：

1. 更新 [`story.md`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/story.md) 顶部 frontmatter
2. 替换 section 文案
3. 更新 `vis.data.source`
4. 更新 `vis.fields`
5. 如有需要，再微调 `src/styles/custom.css`

## 默认不要改什么

除非你需要新功能，否则不要先改 runtime 文件：

- `src/runtime/*`
- `src/layouts/*`
- `src/visualizations/*`

对于很多故事来说，只改 `story.md` 和加入一个 CSV 就够了。
