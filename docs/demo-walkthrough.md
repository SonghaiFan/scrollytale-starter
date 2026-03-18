# Demo Walkthrough

Use this page as a practical demo guide for the starter.

## What The Demo Shows

The default story demonstrates:

- `hero` opening
- static narrative `chapter` sections
- `scrolly-left` and `scrolly-right`
- `scrolly-overlay`
- `::step` interactions using `focus` and `filter`

## Demo Data Used

Built-in sample datasets are loaded automatically for demo code blocks, including:

- `samples.penguins`
- `samples.cars`
- `samples.diamonds`
- `samples.alphabet`
- `samples.olympians`

## Try This In 10 Minutes

1. Open `story.md`
2. Duplicate one section
3. Change `id` and heading text
4. Replace chart code with a simple Plot mark
5. Add two `::step` blocks
6. Run `npm run dev` and scroll-test

## Example Step Pattern

```md
::step{focus="all"}
Show all groups.
::

::step{focus="Group A"}
Highlight Group A.
::
```

With chart code:

```js
const rows = aq.from(sources.myData).objects();
return Plot.dot(
  stepUtils.focusBy("group", rows, { inactiveOpacity: 0.15 }),
  { x: "x", y: "y", fill: "group", ...stepUtils.opacityChannels(), tip: true }
);
```

## Authoring Tips

- Keep section body prose short and scannable
- Keep one visual claim per step
- Prefer `focus` when you need context
- Prefer `filter` when you want strict subset display
