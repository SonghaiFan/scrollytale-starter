# Component API

`Scrolly` and `Step` are available by default in story MDX. Standard MDX imports can override them; no special import syntax or string replacement is involved. These are application components, not VisDelta exports.

## Scrolly and Step

```mdx
import { bar } from 'visdelta'

export const chart = bar([
  { region: 'North', revenue: 18 },
  { region: 'South', revenue: 12 },
  { region: 'West', revenue: 9 },
]).x('region').y('revenue')

<Scrolly>
  <Step chart={chart}>

## All three regions

Start with the whole picture.

  </Step>
  <Step chart={chart.highlight({ region: 'North' })}>

## Look north

The other bars stay visible.

  </Step>
  <Step chart={chart}>

## Back to everyone

All three return to equal emphasis.

  </Step>
</Scrolly>
```

`chart` is a complete native VisDelta declaration, not a mounted DOM chart. Every Step is independent: the final `chart` above clears the middle step's highlight because it uses the original declaration again. Step order is story order. There is no parallel states array or state/view/show alias.

Each Scrolly needs at least one direct Step, each with `chart`. Errors identify the Step number and show the expected syntax. Fragments or custom wrappers around Step are unsupported.

### Optional Scrolly props

| Prop | Contract |
| --- | --- |
| `id` | Generated automatically and stable within the mounted component. Optionally supply a unique nonempty string for a named link target. |
| `title` | Optional visible heading and accessible chart label. Without it, the section is labelled “Chart story”. |
| `layout` | `left` (default) or `right`, indicating chart placement on wide containers. Both stack chart before text on narrow containers. |
| `chartStyle` | Optional `d3`, `paper`, `dark`, or `editorial` preset name, or a native module from `defineChartStyle(...)` in `visdelta/chart-style`. Applies to the entire Scrolly, including a single Step. Omit to inherit the page theme. |
| `mode` | `step` (default) plays to a chart when its Step crosses the reading line. `scroll` continuously ties animation to scroll position. |
| `duration` | Finite nonnegative milliseconds per native serial transition stage, default `800`. Applies to step playback. |
| `controls` | Default `false`. Set to show optional position controls; usually useful for inspecting scroll mode. |
| `hold` | Finite fraction in `[0,1)`, default `0.45`. In scroll mode, each interval holds its source chart for this fraction, then transitions to the next chart. |

Inline expressions such as `chart.highlight(...)` do not require useMemo. Complete declaration content and plugin module identity determine whether a chart session is replaced; status updates, unchanged parent renders and theme changes do not recreate it. Real data or chart declaration changes do. Keep remote refresh policy and named source loading in your own modules; Scrollytale does not infer changing remote content from an unchanged URL.

A single Step renders a static chart. In default step mode, crossing a Step's reading line plays from the current frame to that Step's chart using native VisDelta playback. Scrolling back reverses toward the previous chart; jumping ahead targets the newly active Step. Loading the page at an existing scroll position shows that Step immediately. Reduced motion snaps to authored charts.

For continuous scroll progress, write `<Scrolly mode="scroll">`. The application maps scrolling to `0..numberOfSteps-1`, with authored charts at integer boundaries. `hold` controls how much of each interval keeps its source chart before progressing. The first and final charts hold outside the sequence.

Position sliders are optional inspection tools, enabled with `<Scrolly mode="scroll" controls>`. They move through the same scroll mapping. The starter demonstrates step playback; `/examples/housing` demonstrates continuous progress. Neither shows technical position controls by default.

## Editorial components

Import optional editorial components explicitly when needed:

```mdx
import { Hero, Chapter } from './src/components/story.jsx'

<Hero eyebrow="A story">

# Your title

Your introduction.

</Hero>

<Chapter>

## More context

Ordinary Markdown, links, images and imported components.

</Chapter>
```

The default template only needs Markdown, Scrolly and Step. Use native VisDelta methods directly: `highlight` changes emphasis, `where` changes membership, and `focus` changes the camera.

## Chart presentation

Use `<Scrolly chartStyle="paper">` for a preset, or import `defineChartStyle` from `visdelta/chart-style` and pass its resolved module as `chartStyle={myStyle}`. Define custom modules at module scope to keep their reference stable. Unknown names and incomplete values produce an actionable render error. Plain configuration objects are not accepted; use the native factory.

Style controls chart structure (spacing, grids, axis titles and legend placement); built-in preset keys also activate scoped CSS from the existing VisDelta stylesheet. A custom key supplies no CSS palette or fonts automatically. D3 and custom modules inherit unspecified CSS tokens from the page. Explicit chart colors remain authored values. Page theme changes and resize remeasure the current chart.

Changing a module prepares a replacement at the live timeline position and resumes the current step target before swapping visible charts. The previous chart remains visible if preparation fails. Geometry can differ between styles; this is a presentation replacement, not an animated chart-state operation. Reusing a preset or the same custom module does not replace the controller. There is no per-Step style interpolation or `style`/`theme` alias.

See `/examples/styles` for all four presets and a native custom module.
