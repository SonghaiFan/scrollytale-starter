# 项目模型

这一页解释 `scrollytale-starter` 和配套 AI skill 的关系，以及如何长期维护这个项目。

## 两层结构

整个系统分成两层：

1. `scrollytale-starter`
2. `scrollytale` skill

### 第 1 层：Starter

starter 是 runtime。

它负责：

- 解析 `story.md`
- 加载 CSV 数据
- 渲染 layouts
- 渲染内置 visualizations
- 把故事结构转换成网页

### 第 2 层：Skill

skill 是创作流程。

它负责：

- clone starter
- 检查数据
- 规划故事结构
- 生成或修改 `story.md`

## 为什么这种分层重要

这种分层能让项目更可维护。

如果把 runtime 和创作流程混得太紧：

- starter 会更难理解
- 手动使用的人会被 AI 工具链绑住
- AI agent 更容易改动过多代码

有了这种分层：

- 人可以直接使用 starter
- AI 可以通过 skill 使用 starter
- runtime 和 authoring 可以分别演进

## 维护规则

### 什么时候改 `story.md`

在这些情况下改 `story.md`：

- 新建一个故事
- 修改 section 文案
- 重新映射图表字段
- 重新排序或重命名 section

### 什么时候改 `src/styles/custom.css`

在这些情况下改 `custom.css`：

- 调整间距
- 修改颜色
- 添加轻量的项目定制风格

### 什么时候改 Runtime 代码

只有在你需要这些能力时才改 runtime：

- 新 layout
- 新 vis type
- 新 parser 特性
- 新交互模式

通常涉及的目录是：

- `src/runtime/`
- `src/layouts/`
- `src/visualizations/`

## 给 AI Agent 的建议

默认选择“最小但有用”的改动。

对于一个普通故事任务，建议：

1. 先读这些 docs
2. 再检查 CSV
3. 编辑 `story.md`
4. 运行 `npm run build`

不要只是因为更复杂的图表“理论上可行”，就主动扩展 runtime。

## 给维护者的建议

新增功能时，优先保持这三件事稳定：

1. runtime 继续清晰可读
2. `story.md` 继续容易编写
3. skill 仍然能把 prompt 映射为受支持的结构

如果一个新 runtime feature 让 `story.md` 明显更难读，那它很可能对 starter 来说还太早或太复杂。
