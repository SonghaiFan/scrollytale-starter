# 故事格式

`story.md` 应该更像故事文档，而不是 schema。

默认原则很简单：

- 正常写 Markdown
- 用简短 frontmatter 做 section 设置
- 优先使用直觉性的字段名
- 只有真的需要时才进入进阶 metadata

## 最简单的理解方式

大多数故事只需要三层：

1. 顶部一个 block，写页面标题和数据文件
2. 每个 section 一个短 block
3. 正文用普通 Markdown 来写

## 推荐的全局格式

最容易读写的全局形式是：

```yaml
---
title: "Melbourne Housing Snapshot"
data:
  housing: ./data/demo.csv
custom_style: ./src/styles/custom.css
---
```

### 推荐的全局字段

- `title`
- `data`
- `custom_style`

### `data`

最简单的数据写法是一个 map：

```yaml
data:
  housing: ./data/demo.csv
  rents: ./data/rents.csv
```

当然也仍然支持更长的写法：

```yaml
data:
  sources:
    - id: housing
      path: ./data/demo.csv
```

两种都可以。

## 推荐的 Section 格式

每个 section 用一个简短 frontmatter 开始：

```md
---
id: trend
layout: scrolly-left
chart: line
data: housing
x: year
y: value
series: region
---
```

之后正文就用普通 Markdown 来写。

## 示例

````md
---
title: "Melbourne Housing Snapshot"
data:
  housing: ./data/demo.csv
---

---
id: opening
layout: hero
---

# Where prices rise, pressure concentrates

This page is written like a document, not like a config file.

---
id: trend
layout: scrolly-right
chart: line
data: housing
x: year
y: value
series: region
---

## The gap holds over time

The line chart stays visible while the text scrolls.

::step
All three series move upward over time.
::

::step
The inner region remains the top line throughout the series.
::
````

## 推荐的 Section 字段

大多数人只需要这些字段：

- `id`
- `layout`
- `chart`
- `data`
- `x`
- `y`
- `series`
- `color`
- `headline`
- `dek`

如果不写 `headline`，runtime 会自动使用正文里的第一个 Markdown 标题。

## 推荐的 Layout 值

- `hero`
- `scrolly-left`
- `scrolly-right`
- `full-width`

## 推荐的 Chart 值

- `bar`
- `line`
- `unit`
- `html`

## `::step`

当图表需要固定在原位，而文字按步骤推进时，就用 `::step`。

```md
::step
Inner Melbourne sets the upper boundary for the comparison.
::
```

每个 step 里都可以继续写普通 Markdown。

## 可选的 `::vis`

大多数故事并不需要 `::vis`。

上面那组简短的 section 字段通常已经够用了。但如果你想显式声明一个可视化，也仍然可以写：

```md
::vis{type="bar" data="housing" x="region" y="value"}
::
```

## Inline HTML

正文中可以直接写 HTML：

```md
<div class="callout">
  This is a custom editorial note.
</div>
```

这样能保持表达力，同时不用引入组件框架。

## 进阶字段

项目仍然支持一些更丰富的字段，比如：

- `structure`
- `scene`
- `transition`
- `action`

这些字段更主要服务于：

- AI 推理
- 后续 runtime 功能
- 与 thesis design space 对齐

对大多数作者来说，它们都应该是可选项。

如果你想看这套内部模型，可以去读 [design-space.md](design-space.md)。

## 安全创作规则

如果一个故事可以用这些信息表达：

- 一个支持的 `layout`
- 一个支持的 `chart`
- 真实存在的 CSV 列名

那么通常只改 `story.md` 就够了。

## 旧语法兼容

之前更偏 YAML-heavy 的写法依然支持，所以现有故事不需要马上迁移。
