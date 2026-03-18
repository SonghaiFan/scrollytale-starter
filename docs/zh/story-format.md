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
- 可选的 `chrome`

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

### `chrome`

页面级 chrome 目前保持得很小，也尽量直觉。

例如：

```yaml
chrome:
  bottom_nav: true
```

当前支持的 chrome：

- `bottom_nav`
- `theme_toggle`

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

对于普通叙事段落，你通常可以连 `layout` 都不写。

如果一个 section 没有特殊 layout，starter 现在会默认把它当成 `chapter`。

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

- `chapter`
- `hero`
- `side-by-side`
- `vis-container`
- `scrolly-bottom`
- `scrolly-left`
- `scrolly-overlay`
- `scrolly-right`
- `scrolly-top`
- `full-width`

## Thesis 里的 Layout 名称

如果你更喜欢 thesis 里的那组 layout 名字，starter 现在已经先接入了第一批。

最简单可用的写法是：

```yaml
layout: side-by-side
layout: text-container
layout: vis-container
layout: text-over-vis
chapter:
  flow: horizontal
chapter:
  flow: vertical
```

对于带方向的名字，推荐用 object 形式：

```yaml
layout:
  name: float-to-text
  side: right
```

```yaml
layout:
  name: fixed-to-text
  side: left
```

当前 runtime 映射关系是：

- `side-by-side` -> 当前 starter 里的 strip preset
- `text-container` -> `chapter`
- `vis-container` -> `vis-container`
- `text-over-vis` -> `scrolly-overlay`
- `chapter.flow: horizontal` -> thesis 的 flow metadata
- `chapter.flow: vertical` -> thesis 的 flow metadata
- `float-to-text` + `side` -> `scrolly-left` / `scrolly-right`
- `fixed-to-text` + `side` -> `scrolly-left` / `scrolly-right`

这样我们就能一边保留你喜欢的 design-space vocabulary，一边继续复用现有 runtime preset，而不会再让 `horizontal / vertical` 假装自己是 layout preset。

对于 horizontal chapter，请使用专门的 horizontal scrolly layout：

```yaml
chapter:
  flow: horizontal
---
layout: scrolly-bottom
```

`scrolly-bottom` 和 `scrolly-top` 只应该出现在 `chapter.flow: horizontal` 里。

### `chapter.flow`

如果你想保留 thesis 里的方向语义，但又不想把它硬做成 layout preset，就用 `chapter.flow`。

```yaml
chapter:
  flow: horizontal
```

当前 runtime 已经会用它把连续 section 组织成 horizontal chapter。这个 flow 也会继续向后延续到后面的 section，直到新的 section 再声明另一个 `chapter.flow`。

### `chapter`

`chapter` 是最自然的 narrative layout。

它适合：

- 普通文本段落
- Markdown-first 的书写方式
- 可选的嵌入 figure
- 直接插入到正文里的图片

也就是说，一个简单 section 可以写成：

````md
---
id: context
---

## Why the gap feels larger now

This is just a normal chapter-like section written in Markdown.
````

你也可以直接在 chapter 正文里用普通 Markdown 插入图片：

````md
---
id: shoreline
---

## A chapter can carry inline media

The paragraph flow stays natural, and the image sits inside the story rather than in a separate visualization slot.

![Calm shoreline](https://picsum.photos/1200/480?grayscale)
````

## 推荐的 Chart 值

- `bar`
- `line`
- `scatter`
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

`::step` 也可以带少量图表状态。

例如现在 `line` 和 `bar` 都支持 `focus`：

```md
::step{focus="all"}
让所有 series 一起保持可见。
::

::step{focus="Inner"}
聚焦到 Inner 这一条线或这一组柱子。
::

::step{focus="Outer,Middle"}
同时聚焦多个 series 或类别。
::
```

这会更接近 case study 的方式：

- step 文案负责叙事
- step 属性负责描述图表状态变化

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
