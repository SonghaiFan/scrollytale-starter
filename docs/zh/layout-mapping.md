# Layout 映射

这一页把 thesis 里的 layout vocabulary 翻译成当前 `scrollytale-starter` runtime 能理解的结构。

它主要回答一个实际问题：

`当我们说 Horizontal / Float to text / Text over Vis 时，在这个项目里今天到底对应什么？`

## 如何读这张图

在 thesis 的 layout 图里：

- 绿色 = `text`
- 黄色 = `visualisation`
- 黑色箭头 = 主要阅读 / 运动方向
- 黑色边框 = 主容器或主要舞台

所以 layout 这一行不只是“屏幕上怎么摆”，它还描述了：

- 谁是主导元素
- 谁更像 container
- 文本和可视化是并排、堆叠，还是叠放

## 对照表

| Thesis layout | 含义 | 当前最接近的 starter layout | runtime 状态 | 说明 |
| --- | --- | --- | --- | --- |
| `Horizontal` | 文本和 vis 沿横向 strip 排布 | chapter 级 flow metadata（`chapter.flow: horizontal`）+ starter preset `side-by-side` | metadata / approximation | thesis 里的 `Horizontal` 保留为语义层，当前宽幅 strip runtime 改名为 `side-by-side` |
| `Float to text` | vis 像一个漂浮对象贴着文本流 | `scrolly-left`, `scrolly-right` | partial | 这是当前最接近的实现 |
| `Text container` | 文本是主容器，vis 被嵌进文本流 | `chapter`, `full-width` | partial | 很适合文章式 section 和嵌图 |
| `Text over Vis` | 文本覆盖在可视化之上 | `scrolly-overlay`, `hero` | supported / partial | 当前 `scrolly-overlay` 是最清楚的对应 |
| `Vertical` | 文本和 vis 上下堆叠 | chapter 级 flow metadata（`chapter.flow: vertical`）+ `full-width` 的视觉近似 | metadata / approximation | `Vertical` 现在优先被当成 flow 语义，而不是 preset 名字 |
| `Fixed to text` | vis 绑定在文本旁，而不是主容器 | `scrolly-left`, `scrolly-right` | partial | 与当前 sticky scrolly 最接近 |
| `Vis container` | 可视化是主容器，文本嵌入或依附其中 | `vis-container` | supported | 当前已实现为 chart-first stage + inset copy |
| `Vis over Text` | 可视化压在文本层之上 | none | missing | 是 `Text over Vis` 的相反方向，目前还没建模 |

## 当前解释

starter 现在大致可以分成 7 个 runtime 家族：

- `side-by-side`
- `hero`
- `chapter`
- `full-width`
- `vis-container`
- `scrolly-left` / `scrolly-right`
- `scrolly-overlay`

它们和 thesis design space 的关系大致如下：

### `side-by-side`

- 最接近：starter 对 `Horizontal` 的当前近似实现
- 当前理解：一个沿 x 轴展开的宽幅 side-by-side strip
- marker 规则：如果配 chart，则使用圆形 / vis marker

### `hero`

- 最接近：`Text over Vis`
- 当前理解：full-bleed editorial opening，文本叠在一个视觉场上
- marker 规则：方形 / narrative marker

### `chapter`

- 最接近：`Text container`
- 当前理解：Markdown-first 的文章段落，可选择带 embedded media
- marker 规则：方形 / narrative marker

### `full-width`

- 最接近：`Text container` 和 `Vertical` 之间
- 当前理解：文本和 figure 共用一个宽舞台的 section
- marker 规则：方形 / narrative marker

### `scrolly-left` 和 `scrolly-right`

- 最接近：`Float to text` 和 `Fixed to text` 之间
- 当前理解：经典 sticky-vis + scrolling-copy section
- marker 规则：圆形 / vis marker

### `scrolly-overlay`

- 最接近：`Text over Vis`
- 当前理解：figure 是舞台，文本在其上方移动
- marker 规则：圆形 / vis marker

### `vis-container`

- 最接近：`Vis container`
- 当前理解：图表是主舞台，文本作为 inset copy 放在这个舞台内部
- marker 规则：圆形 / vis marker

## 还缺什么

thesis 里的 layout space 比当前 runtime 更丰富。

目前最明显还缺的三块是：

- `Horizontal`
- `Vis over Text`

它们不只是视觉变体，而是意味着不同的 authoring 和 runtime 行为。

例如：

- `Horizontal` 更像 chapter 级 flow 语义，或者意味着不同的 scroll / paging 模型
- `Vis over Text` 代表比当前 overlay 更强的视觉主导关系

## 建议的 runtime 优先级

如果继续扩 layout system，比较合适的顺序是：

1. 先把 `chapter`、`hero`、`full-width` 明确为方形 marker 的 narrative family。
2. 再把 `scrolly-left`、`scrolly-right`、`scrolly-overlay` 明确为圆形 marker 的 vis family。
3. 先把 `horizontal / vertical` 保持为 chapter flow metadata，再决定什么时候把它们做成真正的 runtime 行为。
4. 把 `vis-over-text` 从概念讨论推进成真正的 preset。

## 为什么这张映射表重要

它能让三件事保持一致：

- thesis 的 design language
- runtime 的 preset
- 未来的 authoring syntax

这样我们既能让 `story.md` 保持直觉，也能继续把 thesis 当成严谨的内部模型。
