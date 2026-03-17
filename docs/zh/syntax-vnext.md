# 下一代语法提案

这份文档提出了 `scrollytale-starter` 的下一步作者语法方案。

它借鉴了 Slidev 更偏 Markdown-first 的创作体验，但目标仍然是滚动叙事网页，而不是 slides。

## 当前状态

这个提案的第一阶段已经在 starter runtime 中实现：

- 用 `---` 分隔的 section frontmatter
- section body 中的 inline HTML
- `::vis`
- `::step`
- 更短、更直觉的图表字段，比如 `chart`、`data`、`x`、`y`

本页剩余内容依然保留为设计 rationale 和后续方向说明。

## 为什么要提出新语法

当前的 `story.md` 虽然可用，但仍然太偏配置文件。

当前推荐的创作体验更接近：

- 一个简短的 section 设置 block
- 以普通 Markdown 为主的正文
- 需要 scrolly 节奏时再补 `::step`

这会带来几个问题：

- Markdown 本身没有被充分利用
- 作者大部分时间都在写配置
- 文件看起来更像 schema，不像故事文档
- AI 容易生成过多 YAML，而不是可读的叙事结构

## 设计目标

下一版语法应该：

1. 继续保持 Markdown-first
2. 同时适合人和 AI 使用
3. 保留数据绑定与 layout 控制
4. 自然支持 inline HTML
5. 创作体验更接近 Slidev
6. 不默认引入 Vue 依赖

## 我们希望从 Slidev 借鉴什么

借鉴它的 authoring 思路，而不是 slide 模型本身。

值得借鉴的点：

- 单一 Markdown 主入口
- 由 frontmatter 驱动结构
- Markdown 是主要写作界面
- 支持 inline HTML
- 在 Markdown 中支持轻量的结构块语法

不应该直接照搬的点：

- 以 slides 作为核心单元
- 演示文稿式的分页语义
- 默认依赖 Vue 组件扩展

## 核心变化

### 当前模型

当前格式：

- 顶层 frontmatter
- `## Section`
- fenced `yaml` block
- 可选 Markdown

这本质上是 YAML-first。

### 提议模型

提议格式：

- 顶层 frontmatter
- section 分隔符
- 简短的 section frontmatter
- 以 Markdown 正文作为主要创作区域
- 用轻量 block directives 表达 step、visual、annotation

这会变成 Markdown-first。

## 目标文件形态

```md
---
title: Melbourne's Price Gap
data:
  sources:
    - id: housing_gap
      path: ./data/housing-gap.csv
custom_style: ./src/styles/custom.css
---

---
layout: hero
scene: focus
---

# Inner Melbourne stays ahead

A short introduction written as normal Markdown.

---
layout: scrolly-right
scene: guide
---

## The ranking is clear

The chart stays on screen while the text steps scroll.

::vis{type="bar" data="housing_gap" x="region" y="value"}
::

::step
Inner Melbourne sets the upper boundary.
::

::step
Middle suburbs sit clearly below the top tier.
::

::step
Outer suburbs remain lowest.
::
```

## 建议的作者单元

### 1. 全局 Frontmatter

继续保留，作为全局故事配置。

适合放：

- `title`
- `structure`
- `data.sources`
- `custom_style`

这部分可以保持和现在接近。

### 2. Section Frontmatter

每个 section 通过分隔符开始，并带一个简短的 frontmatter。

推荐的 section 级字段：

- `layout`
- `scene`
- `transition`
- `action`
- 可选的 `id`

不要重复那些可以从正文推断出来的低价值结构。

### 3. Markdown 正文

正文应该承载大部分故事内容。

用正常 Markdown 来写：

- 标题
- 段落
- 强调
- 列表
- 引用
- 链接
- inline code

这样整个文件看起来更像一个真实文档。

### 4. Inline HTML

允许在 Markdown 正文中直接写 HTML。

例如：

```md
<div class="callout">
  This is a custom editorial note.
</div>
```

这正是我们最值得从 Slidev 借鉴的能力之一。

它能显著增强表达力，而且不需要立刻引入框架级组件系统。

### 5. 轻量 Block Directives

与其使用很大的 YAML blob，不如用简短的结构块。

第一批推荐：

- `::vis`
- `::step`
- `::annotation`

例如：

```md
::vis{type="line" data="housing_gap" x="year" y="value" series="region"}
::
```

```md
::step
All three lines rise across time.
::
```

```md
::annotation
The leader changes only if the data changes. The syntax should not imply extra chart logic.
::
```

## vNext 中的核心概念

### Visual Binding

把图表绑定写成紧凑的 inline 配置：

```md
::vis{type="bar" data="housing_gap" x="region" y="value"}
::
```

它会比大段 YAML 更容易扫描。

### Step Content

把 steps 当作正文块，而不是 YAML 里的字符串数组。

当前：

```yaml
copy:
  steps:
    - "Inner first."
    - "Middle second."
    - "Outer third."
```

提议：

```md
::step
Inner first.
::

::step
Middle second.
::

::step
Outer third.
::
```

这更像直接在写内容，而不是写配置。

### HTML Containers

如果某个 section 需要自定义 editorial markup，就让它直接存在于正文中。

例如：

```md
<div class="stat-grid">
  <div class="stat-card">Inner remains highest.</div>
  <div class="stat-card">Middle remains in between.</div>
  <div class="stat-card">Outer remains lowest.</div>
</div>
```

这样就不需要强迫所有内容都塞进 YAML。

## 与当前语法的比较

### 当前语法

优点：

- 显式
- 易验证
- 易于 normalize

缺点：

- 冗长
- 可读性一般
- 没有充分利用 Markdown
- 创作手感较弱

### 提议语法

优点：

- 更自然
- 更像文档
- 更像 editorial authoring
- 更容易混合 Markdown 与 HTML

缺点：

- parser 会更复杂
- directives 需要更清晰的语法约束
- 验证逻辑会略复杂一些

## 推荐的实现范围

不要一次性重做全部语法。

建议分阶段实现。

### Phase 1

- 保留全局 frontmatter
- 增加 section 分隔 + section frontmatter
- 支持 inline HTML
- 支持 `::step`
- 支持 `::vis`

### Phase 2

- 支持 `::annotation`
- 支持更丰富的块结构
- 支持更紧凑的 section metadata 写法

### Phase 3

- 考虑可选的可复用组件
- 考虑作者自定义 block 或 plugin

## 迁移策略

不要立刻破坏当前格式。

推荐做法：

1. 继续支持当前 YAML-first 语法
2. 新增对新语法的 parser 分支
3. 把两种写法都 normalize 到同一个内部 story JSON
4. 再逐步把示例和文档迁移到新语法

这样 runtime 只需要维护一个统一的内部模型，而作者语法可以逐步演进。

## Parser 层意味着什么

parser 需要理解：

- 全局 frontmatter
- 重复的 section 分隔
- section frontmatter
- Markdown 正文块
- `::step`、`::vis` 这样的自定义 directives

最重要的架构思想是：

- 不同 authoring syntax 都可以映射到同一个 normalized story model

这样 renderer 和 visualizations 就不需要关心作者最初用了哪一种语法。

## 建议结论

建议采用一个 Markdown-first 的 vNext 语法，它应该：

- 保留 frontmatter
- 用分隔符表达 sections
- 允许 inline HTML
- 用轻量 directives 表达 visuals 和 scrolly steps

这样 `scrollytale-starter` 的创作体验会更接近 Slidev，但仍然保持 D3 scrollytelling runtime 的核心模型。
