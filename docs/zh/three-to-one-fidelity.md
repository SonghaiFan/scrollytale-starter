# Three-to-One 高保真还原规范

这页定义了在 `scrollytale-starter` 里，什么才叫“高保真还原” `demo_three-to-one-main`。

它不是泛泛的视觉愿望清单，而是第一参考 case 的具体还原 checklist。

## 目标

目标是让一个用 `scrollytale-starter` 写出来的故事，在这些方面都能明显接近原始 `three-to-one` demo：

- layout 节奏
- editorial 风格
- sticky 行为
- overlay 行为
- page chrome
- scroll pacing

## 参考来源

主要参考文件：

- [`demo_three-to-one-main/index.html`](https://github.com/SonghaiFan/scrollytale/blob/main/demo_three-to-one-main/index.html)
- [`demo_three-to-one-main/src/css/three-to-one.css`](https://github.com/SonghaiFan/scrollytale/blob/main/demo_three-to-one-main/src/css/three-to-one.css)

starter 中对应的适配层：

- [`src/styles/threeToOne.css`](https://github.com/SonghaiFan/scrollytale-starter/blob/main/src/styles/threeToOne.css)

## Fidelity 分层

### 1. Layout Fidelity

这些是 demo 里最关键的空间组织方式：

- scrolly 段落之间的 `chapter` block
- 带全宽背景图的 `hero intro`
- `scrolly side left`
- `scrolly side right`
- `scrolly overlay`
- scrolly 中间穿插 `chapter + embedded media`

当前 starter 的支持情况：

- `hero`：部分接近
- `scrolly-left`：比较接近
- `scrolly-right`：比较接近
- `scrolly-overlay`：已支持
- `full-width`：只能部分代替 chapter block

### 2. Theme Fidelity

这些视觉细节共同构成了 demo 的识别度：

- `Raleway` 正文字体
- `Roboto Mono` 工具性字体
- 饱和的蓝色和绿色强调色
- 叠在页面背景上的透明白色 panel
- 细黑边框
- 很轻的 blur
- 很克制的圆角
- 大尺度 editorial hero 标题

当前 starter 的支持情况：

- 字体：比较接近
- 色板：比较接近
- 边框：比较接近
- 透明 step 卡片：比较接近
- hero 的尺度和留白：部分接近

### 3. Interaction Fidelity

很多“美感”其实来自这些行为：

- sticky figure 在 step 序列中固定
- step 卡片从低透明度逐步高亮
- 大号 step 文本块
- 较大的滚动间隔
- 漂浮在 figure 上方的 overlay article panel
- 克制但顺滑的过渡

当前 starter 的支持情况：

- sticky figure：已支持
- `::step` 节奏：已支持
- active step 状态：已支持
- overlay article 行为：缺失
- 与 chrome 联动的滚动状态：缺失

### 4. Chrome Fidelity

demo 还有一层页面级 UI：

- intro theme toggle
- 底部固定导航
- previous / next 控制
- 动态章节指示
- scroll hint / mouse indicator

当前 starter 的支持情况：

- 底部 fixed navigation：已支持
- theme toggle：still developing
- scroll hint：still developing
- 动态 chapter indicator：部分支持，当前由 active bottom nav state 提供

## Fidelity Checklist

## 第一优先级必须还原

这些应该被视为 v1 fidelity blocker：

1. 更接近原始 editorial section 的 `chapter` 表现
2. 带大标题和 scroll hint 的 full-width intro
3. 透明 step panel 和低透明 inactive state
4. 底部固定导航条

## 第二优先级

这些也重要，但可以在核心 layout fidelity 落地之后再做：

1. theme toggle
2. scrolly 模块之间的 embedded chapter figures
3. tooltip container system
4. 底部导航中的动态章节状态

## 后续增强

这些属于主干稳定之后的 polish：

1. 更严格的动画 timing 对齐
2. theme switching 持久化
3. 更丰富的章节锚点和跳转逻辑

## 需要的 Runtime 工作

要达到第一个高保真里程碑，starter 大概率需要新增这些能力：

### 新的 Layout Preset

- `scrolly-overlay`
- 可选的 `chapter` alias，用来表示 editorial full-width block

### 新的 Page Chrome

- `bottom-nav`
- `scroll-hint`
- 可选的 `theme-toggle`

### 新的 Story 字段

这些字段仍然应该保持直觉性：

```yaml
chrome:
  bottom_nav: true
  scroll_hint: true

theme: three-to-one
```

section 可能会长这样：

```yaml
layout: scrolly-overlay
chart: line
data: housing
```

### 新的 Runtime 职责

runtime 需要开始管理：

- chapter 注册
- 当前 active section 跟踪
- bottom nav 状态
- overlay 专属的 spacing 和 pointer 行为

## 不该被破坏的东西

在提高 fidelity 的同时，starter 仍然应该保留：

- Markdown-first 的创作方式
- 简单的 `layout / chart / data / x / y` 语法
- 对普通故事来说，AI 不需要改 runtime 代码也能产出结果

高保真应该来自更好的 preset 和更强的 runtime primitive，而不是让 `story.md` 变难写。

## 推荐实现顺序

1. 先做 `scrolly-overlay`
2. 再做 `bottom-nav` chrome
3. 再加 `theme: three-to-one` 页面级 preset
4. 优化 hero intro 的留白与 scroll hint
5. 增加 chapter 注册和 nav 状态联动

## 完成标准

我们可以把第一阶段 fidelity milestone 定义为：

1. starter 能复刻 side-left、side-right、overlay 三种 scrolly section
2. 页面包含类似 demo 的底部 fixed nav
3. hero 和 step panel 的观感明显接近原始 case
4. 不需要每个页面都手写大量 custom CSS，也能看起来就是 “three-to-one”
