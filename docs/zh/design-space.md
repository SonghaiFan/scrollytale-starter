<div class="design-space-page">

<div class="design-space-panel design-space-hero">
  <p class="design-space-eyebrow">Scrollytelling design space</p>
  <h1>设计空间</h1>
  <p class="design-space-lead">这是一张把 thesis 里的 design space 带进 <code>scrollytale-starter</code> 的 visual atlas。</p>
  <div class="design-space-legend">
    <span class="design-space-token blue">Structure</span>
    <span class="design-space-token yellow">Layout</span>
    <span class="design-space-token green">Text</span>
    <span class="design-space-token red">Transition</span>
  </div>
  <p class="design-space-note"><strong>进阶 / 内部页面。</strong> 日常创作请先看 <a href="./story-format">story-format.md</a>。这一页主要帮助 runtime 和 AI 更深入地理解故事结构。</p>
</div>

## 总览

<div class="design-space-panel design-space-figure-frame">

![Scrollytelling design space](/design-space/p2-design-space-main.png)

</div>

这套 vocabulary 来自 thesis 中关于 scrollytelling design space 的章节，分成四个维度：

- `Structure`
- `Layout`
- `Transition`
- `Action`

复制进 starter 的 icon 位于：

- `public/design-space/icons/`
- `docs/public/design-space/icons/`

runtime 中对应的 taxonomy 位于 [`src/runtime/designSpace.js`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/src/runtime/designSpace.js)。

<div class="design-space-grid design-space-grid-compact">
  <div class="design-space-card">
    <h3>这页为什么存在</h3>
    <p>为了把 academic model 留在 starter 里，但又不要求普通作者先学完整套 taxonomy 才能开始写故事。</p>
  </div>
  <div class="design-space-card">
    <h3>它实际服务什么</h3>
    <p>文档、icon 资产、story metadata 归一化、AI prompting，以及后续 runtime 规划。</p>
  </div>
</div>

## 它如何映射到 `story.md`

starter 仍然保持 Markdown-first 的创作方式，但现在可以接受更丰富的 design-space metadata。

### 全局 Structure

你仍然可以使用简单形式：

```yaml
structure: linear
```

也可以使用更接近学术表达的形式：

```yaml
structure:
  family: linear
  pattern: burger
```

当前 runtime 仍然会按线性 DOM 流程渲染页面，但这些额外 pattern metadata 会被保留下来，方便后续做 authoring、AI prompting 和 runtime 扩展。

### Section Layout

你仍然可以写简单 preset：

```yaml
layout: scrolly-right
```

也可以附带 design-space 字段：

```yaml
layout:
  preset: scrolly-right
  axis: vertical
  binding: float-to-text
  container: vis-container
```

这样 `story.md` 就能同时表达 starter 的实际 preset 和论文中的 layout 语言。

### Scene、Segue 和 Action

thesis 里的 transition / action 语言，现在映射为：

- `scene`：`focus`、`guide`、`granularity`、`observation`
- `transition.segue`：`point-to-line`、`line-to-area`、`morph`、`division-merge`、`pack-unpack`
- `action.trigger`：`enter`、`exit`、`step`、`scroll`
- `action.affordance`：`header`、`in-line`、`tooltip`

示例：

````md
---
title: "Rental pressure across Melbourne"
structure:
  family: linear
  pattern: burger
data:
  sources:
    - id: rents
      path: ./data/rents.csv
---

---
id: widening-gap
layout:
  preset: scrolly-right
  axis: vertical
  binding: float-to-text
  container: vis-container
scene: granularity
transition:
  type: step
  segue: morph
action:
  trigger: step
  affordance:
    - tooltip
---

## The gap becomes visible at suburb level

::vis{type="line" data="rents" x="year" y="value" series="region"}
::

::step
The metro average hides the largest gaps.
::

::step
At suburb level, the spread becomes much wider.
::
````

## 当前支持矩阵

这里分三类：

- <span class="status-pill supported">Supported</span>：runtime 里已经有实际行为
- <span class="status-pill metadata">Metadata only</span>：语法和归一化已支持，但还没有一等 runtime 行为
- <span class="status-pill developing">Still developing</span>：还在开发中，尚未进入 runtime

## 仍在开发中的重点部分

<div class="design-space-grid">
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-header.png" alt="Header icon" /> Header navigation</h3>
    <span class="status-pill developing">Still developing</span>
    <p>它对非线性的 story 入口和章节跳转很重要。</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-tooltip.png" alt="Tooltip icon" /> Tooltip system</h3>
    <span class="status-pill developing">Still developing</span>
    <p>更适合先做成共享 runtime 组件，而不是散落在各个图表里单独实现。</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-in-line.png" alt="In-line icon" /> In-line controls</h3>
    <span class="status-pill developing">Still developing</span>
    <p>适合做轻量 toggle，帮助读者在段落内部完成局部探索。</p>
  </div>
  <div class="design-space-card">
    <h3><img class="design-space-icon" src="/design-space/icons/p2-icon-morph.png" alt="Morph icon" /> Segue transitions</h3>
    <span class="status-pill developing">Still developing</span>
    <p>`morph`、`point-to-line` 和 `pack-unpack` 还需要可复用的视觉 transition primitive。</p>
  </div>
</div>

### Structure

| Pattern | 状态 | 说明 |
| --- | --- | --- |
| `linear` | `supported` | starter 的默认流程 |
| `parallel`、`bypass`、`branch`、`merge` | `metadata` | 已适合 authoring / 规划，后续可扩展导航 |

### Layout

| Preset / Pattern | 状态 | 说明 |
| --- | --- | --- |
| `hero` | `supported` | 近似 editorial opening |
| `scrolly-left` | `supported` | sticky figure + text steps |
| `scrolly-right` | `supported` | sticky figure + text steps |
| `full-width` | `supported` | 普通 flow section |
| `scrolly-overlay` | <span class="status-pill developing">Still developing</span> | 为了完整覆盖 `three-to-one` 和 `Nick_2` 仍然需要 |
| `axis`、`binding`、`container`、`overlap` metadata | `metadata` | 已保存在 normalized story object 中 |

### Transition

| Pattern | 状态 | 说明 |
| --- | --- | --- |
| ![](/design-space/icons/p2-icon-focus.png) `focus` | `supported` | 当前可作为 scene label 使用 |
| ![](/design-space/icons/p2-icon-guide.png) `guide` | `supported` | 当前可作为 scene label 使用 |
| ![](/design-space/icons/p2-icon-granularity.png) `granularity` | `metadata` | 语法和归一化已接受 |
| ![](/design-space/icons/p2-icon-observation.png) `observation` | `supported` | 当前可作为 scene label 使用 |
| ![](/design-space/icons/p2-icon-point-to-line.png) `point-to-line` | `metadata` | 需要可复用的 vis transition primitive |
| ![](/design-space/icons/p2-icon-line-to-area.png) `line-to-area` | `metadata` | 同上 |
| ![](/design-space/icons/p2-icon-morph.png) `morph` | `metadata` | 同上 |
| ![](/design-space/icons/p2-icon-merge.png) `division-merge` | `metadata` | 同上 |
| ![](/design-space/icons/p2-icon-unpack.png) `pack-unpack` | `metadata` | 同上 |

### Action

| Pattern | 状态 | 说明 |
| --- | --- | --- |
| ![](/design-space/icons/p2-icon-enter.png) `enter` | `metadata` | 语法已支持，生命周期 hook 还比较薄 |
| ![](/design-space/icons/p2-icon-exit.png) `exit` | `metadata` | 同上 |
| ![](/design-space/icons/p2-icon-step.png) `step` | `supported` | 已通过 `::step` + Scrollama 工作 |
| ![](/design-space/icons/p2-icon-scroll.png) `scroll` | `supported` | 当前默认的 scrolly 动作模型 |
| ![](/design-space/icons/p2-icon-header.png) `header` | <span class="status-pill developing">Still developing</span> | 非线性导航需要它 |
| ![](/design-space/icons/p2-icon-in-line.png) `in-line` | <span class="status-pill developing">Still developing</span> | 适合作为嵌入段落的控制器 |
| ![](/design-space/icons/p2-icon-tooltip.png) `tooltip` | <span class="status-pill developing">Still developing</span> | 很适合作为共享 runtime 组件 |

## 为什么这件事重要

这样项目就有了一套贯通以下场景的共同语言：

- thesis 写作
- case study 分析
- `story.md` 创作
- AI prompting
- 后续 runtime 规划

starter 不需要在“学术”与“工程”之间二选一。现在 design space 就是连接两者的桥。

## 接下来最值得做的 runtime 工作

1. 把 `scrolly-overlay` 做成下一个 layout preset。
2. 把 `transition.segue` 从 metadata 变成可复用的 vis controller。
3. 增加共享的 `tooltip` 和 `header` 组件，让非线性 structure 真正进入 runtime。

</div>
