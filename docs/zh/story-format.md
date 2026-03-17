# 故事格式

`story.md` 使用 Markdown 加结构化 YAML block。

它由以下部分组成：

1. 一个全局 frontmatter
2. 一个或多个 `## Section` 标题
3. 每个 section 标题下方一个 fenced `yaml` block
4. YAML block 后可选的自由 Markdown 正文

## 全局 Frontmatter

```yaml
---
title: "Melbourne's Price Gap Holds Year After Year"
structure: linear
data:
  sources:
    - id: housing_gap
      path: ./data/housing-gap.csv
custom_style: ./src/styles/custom.css
---
```

### 支持的全局字段

- `title`
- `structure`
- `data.sources`
- `custom_style`

### `data.sources`

每个数据源都需要：

- `id`：供 section 内引用的短名称
- `path`：指向 `public/` 下的路径，通常是 `./data/your-file.csv`

## Section 结构

例子：

````md
## Trend
```yaml
id: trend
layout: scrolly-left
scene: observation
headline: "The same ordering survives over time"
dek: "The line chart shows movement, but not reversal."
action:
  trigger: step
transition:
  type: step
vis:
  type: line
  data:
    source: housing_gap
  fields:
    x: year
    y: value
    series: region
copy:
  steps:
    - "All three regions move upward from 2019 to 2022."
    - "The inner region remains the top line throughout the series."
    - "Middle and outer regions rise too, but they never catch the leader."
```

可选的 Markdown 正文可以写在这里。
````

## 支持的 v0 字段

### `layout`

- `hero`
- `scrolly-left`
- `scrolly-right`
- `full-width`

### `scene`

- `focus`
- `guide`
- `observation`

### `action.trigger`

- `enter`
- `exit`
- `step`
- `scroll`

### `transition.type`

- `none`
- `step`
- `morph-lite`

### `vis.type`

- `html`
- `bar`
- `line`
- `unit`

## `vis.fields`

典型映射：

- `bar`
  - `x`：分类字段
  - `y`：数值字段
- `line`
  - `x`：日期或有序数值字段
  - `y`：数值字段
  - `series`：分类字段
- `unit`
  - `color`：分类字段

## `copy`

建议使用：

- `summary`：静态 section 或 full-width section
- `steps`：scrolly section
- `annotations`：保留给后续扩展

## 安全创作规则

如果一个故事可以用以下方式表达：

- 一个支持的 layout
- 一个支持的 vis type
- 真实存在的 CSV 列名

那么它通常只需要编辑 `story.md` 就能实现。
