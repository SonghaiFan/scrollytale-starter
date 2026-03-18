# 创作配方

本页提供可直接复制的创作模式。

## 配方 1：基础柱状图 Section

````md
---
id: summary
layout: chapter
---

## 区域对比

```plot
Plot.barY(sources.housing, {
  x: "region",
  y: "value",
  fill: "region",
  tip: true
})
```
````

## 配方 2：Focus 交互

```plot
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region")
    .rollup({ value: aq.op.sum("value") })
    .objects();

  return Plot.barY(
    stepUtils.focusBy("region", rows, { inactiveOpacity: 0.15 }),
    { x: "region", y: "value", fill: "region", ...stepUtils.opacityChannels(), tip: true }
  );
})()
```

## 配方 3：Filter 交互

```plot
Plot.line(
  stepUtils.filterBy(
    "region",
    aq.from(sources.housing).orderby("region", "year").objects()
  ),
  { x: "year", y: "value", stroke: "region", tip: true }
)
```

## 配方 4：带 Tooltip 的散点图

```plot
Plot.dot(sources.points, {
  x: "x",
  y: "y",
  fill: "category",
  r: 4,
  tip: true
})
```

## 快速排查

- 列名必须与数据完全一致
- 空值较多字段应先过滤
- 分享前务必运行 `npm run build`
