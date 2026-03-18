---
title: "What the data reveals"
chrome:
  bottom_nav: true
  theme_toggle: true
custom_style: ./src/styles/custom.css
---

---
id: opening
layout: hero
---
# Data finds the patterns we miss

Every dataset hides structure that a table of numbers never shows. A well-chosen chart makes the shape of the data visible in seconds. This story walks through five classic datasets — penguins, cars, diamonds, letters, and Olympic athletes — using each one to demonstrate a different layout and interaction pattern.

---
id: intro
---
## How this page works

This page is a living demonstration of the Scrollytale authoring format.

The headings and prose you are reading are plain Markdown. Charts are defined as `plot` code blocks directly inside the story file. Scroll interactions come from `::step` directives. No separate configuration files are needed — the entire story lives in a single `story.md`.

Each section below uses a different layout to match the shape of its argument.

---
id: penguins
layout: scrolly-right
---
## Three species, one scatterplot

Adelie, Chinstrap, and Gentoo penguins share the same Antarctic islands. They eat similar prey and face similar conditions. Yet plotting bill length against bill depth separates them into three tight clouds — cleanly enough that the chart nearly replaces a species label.

The clusters emerge from evolutionary pressure. Each species occupies a different ecological niche, and bill morphology reflects what and how they eat.

```plot
(() => {
  const focused = step?.focus && !/^(all|\*)$/i.test(step.focus)
    ? new Set(step.focus.split(",").map(s => s.trim()))
    : null;
  return Plot.dot(
    samples.penguins
      .filter(d => d.culmen_length_mm != null && d.culmen_depth_mm != null)
      .map(d => ({
        ...d,
        __opacity: !focused || focused.has(d.species) ? 1 : 0.08
      })),
    {
      x: "culmen_length_mm",
      y: "culmen_depth_mm",
      stroke: "species",
      fill: "species",
      fillOpacity: "__opacity",
      strokeOpacity: "__opacity",
      r: 4,
      tip: true
    }
  );
})()
```

::step{focus="all"}
All 344 penguins together. Three clusters are already visible before any filtering — bill shape alone is nearly sufficient to classify species.
::

::step{focus="Adelie"}
**Adelie** penguins have shorter bills with greater depth. They are the most widely distributed species and appear on all three islands in the dataset.
::

::step{focus="Chinstrap"}
**Chinstrap** penguins sit at longer, still-deep bills. Their narrow measurement range makes them the most tightly clustered of the three, with almost no overlap with Gentoo.
::

::step{focus="Gentoo"}
**Gentoo** penguins stand apart: long, shallow bills, and the heaviest body mass in the dataset. They are the easiest species to identify from bill shape alone.
::

---
id: cars-efficiency
layout: scrolly-left
---
## Fifty years of fuel efficiency

The oil embargo of 1973 forced a reckoning in the American automobile industry. This dataset — originally from the Carnegie Mellon StatLib repository — captures the transition: engine displacement fell, and miles per gallon climbed. The shift did not happen uniformly across all engine types.

```plot
(() => {
  const rows = samples.cars
    .filter(d => d["economy (mpg)"] != null)
    .map(d => ({
      ...d,
      year: d.year < 100 ? 1900 + d.year : d.year,
      cyl: String(d.cylinders)
    }));
  const grouped = stepUtils.focusBy(
    "cyl",
    aq.from(rows)
    .groupby("cyl", "year")
    .rollup({ mpg: aq.op.mean("economy (mpg)") })
    .orderby("year")
    .objects(),
    { inactiveOpacity: 0.08 }
  );
  return Plot.line(grouped, {
    x: "year",
    y: "mpg",
    stroke: "cyl",
    strokeOpacity: "__opacity",
    strokeWidth: 2.5,
    tip: true
  });
})()
```

::step{focus="all"}
All cylinder groups from 1970 to 1982. The overall fleet efficiency improved from the mid-seventies onward as composition shifted away from large engines.
::

::step{focus="4"}
**4-cylinder** cars were the efficiency leaders throughout. Their MPG stayed highest and grew steadily — driven largely by Japanese and European imports entering the American market.
::

::step{focus="6"}
**6-cylinder** cars occupied the middle ground: better than the large V8s, but never as efficient as the smallest engines. Their gains across the period were modest.
::

::step{focus="8"}
**8-cylinder** cars dominated the early data. Efficiency improved after the crisis, but they remained the lowest performers — and nearly vanished from new model lines by 1982.
::

---
id: diamonds-price
layout: scrolly-overlay
---
## What makes a diamond expensive?

Carat weight is the most obvious driver of diamond price. But cut quality changes the relationship substantially. A well-cut stone commands a premium over a poorly cut stone of the same mass. With 53,940 diamonds in this dataset, the full distribution becomes visible — and cut quality begins to separate the clouds.

```plot
(() => {
  const cutOrder = ["Fair", "Good", "Very Good", "Premium", "Ideal"];
  const rows = step?.filter
    ? samples.diamonds.filter(d => d.cut === step.filter)
    : samples.diamonds;
  return Plot.dot(rows, {
    x: "carat",
    y: "price",
    stroke: "cut",
    fill: "cut",
    r: 1.5,
    fillOpacity: 0.4,
    tip: true,
    color: { domain: cutOrder }
  });
})()
```

::step
The full dataset: 53,940 diamonds plotted by carat and price. The relationship is clear but noisy — cut quality colors the points but is hard to read at this density.
::

::step{filter="Fair"}
**Fair** cut stones sacrifice sparkle for weight retention. The price ceiling for a given carat is lower than any other cut category — the market discounts the lost light return.
::

::step{filter="Good"}
**Good** cut stones recover some of the sparkle. Prices are higher than Fair at equivalent weight, and the distribution begins to tighten.
::

::step{filter="Premium"}
**Premium** cut stones are optimised for carat weight while preserving strong sparkle. Prices are high and variable — Premium stones can be overpriced relative to Ideal at the same carat.
::

::step{filter="Ideal"}
**Ideal** cut stones have the highest light return. The price ceiling is highest here — and the distribution is notably tighter than other cuts, reflecting a consistent quality standard.
::

---
id: alphabet-frequency
---
## Some patterns need no scrolling

Not every insight requires interaction. The frequency distribution of English letters is fully legible as a single static chart. The 26-letter hierarchy underpins everything from Morse code design to Scrabble tile values — E, T, A, O, I dominate, while Q, X, Z sit at the tail.

```plot
Plot.plot({
  x: { axis: "top", grid: true, percent: true, label: "Frequency in English text (%)" },
  y: { label: null },
  marks: [
    Plot.ruleX([0]),
    Plot.barX(
      samples.alphabet,
      {
        x: "frequency",
        y: "letter",
        fill: "steelblue",
        sort: { y: "x", reverse: true },
        tip: true
      }
    )
  ]
})
```

Samuel Morse observed letter frequency in a printer's type case to assign the shortest codes to the most common letters. E (·) and T (–) are the two most frequent letters — and the two shortest Morse symbols.

---
id: olympians-body
layout: scrolly-right
---
## Body type follows sport

Olympic athletes are not a uniform population. The physical demands of each sport select for very different morphologies — decades of specialisation have sharpened the divergence. Plotting height against weight for six disciplines reveals clusters that reflect those demands directly.

```plot
(() => {
  const sports = ["swimming", "athletics", "gymnastics", "weightlifting", "basketball", "rowing"];
  const toTitleCase = value => String(value)
    .split(" ")
    .map(token => token ? token[0].toUpperCase() + token.slice(1) : token)
    .join(" ");
  const rows = stepUtils.focusBy(
    "sport",
    samples.olympians
    .filter(d => sports.includes(String(d.sport).toLowerCase()) && d.height != null && d.weight != null)
    .map(d => ({
      ...d,
      sportLabel: toTitleCase(d.sport)
    })),
    { inactiveOpacity: 0.05, activeOpacity: 0.8 }
  );
  return Plot.dot(rows, {
    x: "weight",
    y: "height",
    stroke: "sportLabel",
    fill: "sportLabel",
    fillOpacity: "__opacity",
    strokeOpacity: "__opacity",
    r: 3,
    tip: true
  });
})()
```

::step{focus="all"}
Six sports, hundreds of athletes. Two poles are already visible: tall-and-lean at the top, short-and-dense at the bottom. Most sports occupy one pole or the other.
::

::step{focus="Basketball"}
**Basketball** players cluster top-right — the tallest and heaviest group. Height above 190 cm is nearly universal; weight varies between guards and centres.
::

::step{focus="Rowing"}
**Rowing** athletes are tall but lighter than basketball players. The sport rewards height for leverage but demands cardiovascular endurance, which limits added mass.
::

::step{focus="Swimming"}
**Swimming** athletes sit centre-top: moderate-to-tall, moderate weight. A lean, long body reduces drag and increases stroke length — the optimal shape for water.
::

::step{focus="Athletics"}
**Athletics** spans the widest spread of any sport here. Sprinters are heavier and more muscular; distance runners are lighter and shorter. Every event selects for a different optimum.
::

::step{focus="Weightlifting"}
**Weightlifting** athletes are compact and dense — short-to-medium height, high weight. The sport is contested by weight class, which constrains height while rewarding strength.
::

::step{focus="Gymnastics"}
**Gymnastics** is the inverse of basketball: short, light, tightly clustered. The physical demands have converged on a narrow morphological window that has grown narrower over decades.
::

---
id: closing
---

## Syntax and story, together

This page used five datasets, four layout types, and three interaction patterns — all authored in a single Markdown file with no separate configuration.

The format is designed so that chart code lives beside the prose that explains it. Each `::step` block owns both the narrative and the visual state for that moment. The `focus` keyword highlights a subset while keeping context visible; `filter` removes everything else.

To write your own story: open `story.md`, add a frontmatter block with an `id` and a `layout`, write a `plot` code block, and add `::step` directives. `samples` gives you twelve ready-to-use datasets. `sources` connects to your own CSV or JSON files. The runtime handles the rest.

![A calm shoreline](https://picsum.photos/1200/480?grayscale)
