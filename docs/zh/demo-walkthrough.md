# 示例演练

本页是 starter 默认故事的实操演练。

## 示例包含什么

默认示例展示了：

- `hero` 开场
- 静态 `chapter` 段落
- `scrolly-left` 和 `scrolly-right`
- `scrolly-overlay`
- 使用 `focus` 和 `filter` 的 `::step` 交互

## 示例数据

演示代码可以直接使用内置样本数据，例如：

- `samples.penguins`
- `samples.cars`
- `samples.diamonds`
- `samples.alphabet`
- `samples.olympians`

## 10 分钟动手

1. 打开 `story.md`
2. 复制一个 section
3. 修改 `id` 和标题
4. 换成一个简单 Plot 代码块
5. 增加两个 `::step`
6. 运行 `npm run dev` 并滚动检查

## 常用 Step 模式

```md
::step{focus="all"}
显示全部组。
::

::step{focus="Group A"}
高亮 Group A。
::
```

对应图表代码：

```js
const rows = aq.from(sources.myData).objects();
return Plot.dot(
  stepUtils.focusBy("group", rows, { inactiveOpacity: 0.15 }),
  { x: "x", y: "y", fill: "group", ...stepUtils.opacityChannels(), tip: true }
);
```

## 写作建议

- 每个 step 只表达一个视觉结论
- 需要保留上下文时优先用 `focus`
- 需要只看子集时用 `filter`
