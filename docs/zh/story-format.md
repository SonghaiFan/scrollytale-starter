# 故事格式

本页是推荐的 `story.md` 写法。

## 1. 全局 Frontmatter

`story.md` 顶部：

```yaml
---
title: "My Story"
data:
  housing: ./data/housing.csv
custom_style: ./src/styles/custom.css
chrome:
  bottom_nav: true
  theme_toggle: true
---
```

## 2. Section 结构

每个 section 先写 frontmatter：

```md
---
id: trend
layout: scrolly-right
---
```

然后写普通 Markdown 正文。

## 3. 布局选项

支持布局：

- `chapter`
- `hero`
- `scrolly-left`
- `scrolly-right`
- `scrolly-overlay`
- `full-width`

如果不写 `layout`，默认按 `chapter` 处理。

## 4. Plot 图表代码

使用 `plot` 代码块：

```plot
Plot.barY(sources.housing, { x: "region", y: "value", fill: "region", tip: true })
```

代码块内可用变量：

- `Plot`
- `aq`
- `d3`
- `sources`
- `samples`
- `data`
- `step`
- `stepUtils`
- `section`
- `dimensions`

## 5. Step 块

在 scrolly section 中使用 `::step`：

```md
::step
这一步的叙事文案。
::
```

可选 step 参数：

```md
::step{focus="all"}
显示全部。
::

::step{focus="Inner"}
高亮 Inner。
::

::step{filter="Inner"}
只显示 Inner。
::
```

## 6. stepUtils 辅助

可直接使用：

- `stepUtils.focus(rows, { field, inactiveOpacity, activeOpacity, opacityField })`
- `stepUtils.focusBy(field, rows, options)`
- `stepUtils.filter(rows, { field })`
- `stepUtils.filterBy(field, rows, options)`
- `stepUtils.opacityChannels(opacityField)`
- `stepUtils.values(intent)`

### Focus 示例

```plot
(() => {
  const rows = aq.from(sources.housing)
    .groupby("region")
    .rollup({ value: aq.op.sum("value") })
    .objects();

  return Plot.barY(
    stepUtils.focusBy("region", rows, { inactiveOpacity: 0.15 }),
    {
      x: "region",
      y: "value",
      fill: "region",
      ...stepUtils.opacityChannels(),
      tip: true,
    }
  );
})()
```

### Filter 示例

```plot
Plot.line(
  stepUtils.filterBy(
    "region",
    aq.from(sources.housing).orderby("region", "year").objects()
  ),
  { x: "year", y: "value", stroke: "region", tip: true }
)
```

## 7. 推荐实践

- 每个 step 只讲一个点
- section id 保持稳定
- 字段名与 CSV 列名严格一致
- 分享前先跑 `npm run build`
