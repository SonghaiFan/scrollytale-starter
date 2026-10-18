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
| `hold` | Finite fraction in `[0,1)`, default `0.45`. Each interval holds its source chart for this fraction, then transitions to the next chart. |

Inline expressions such as `chart.highlight(...)` do not require useMemo. Complete declaration content and plugin module identity determine whether a chart session is replaced; status updates, unchanged parent renders and theme changes do not recreate it. Real data or chart declaration changes do. Keep remote refresh policy and named source loading in your own modules; Scrollytale does not infer changing remote content from an unchanged URL.

A single Step renders a static chart. The application maps scroll progress to `0..numberOfSteps-1`, with each authored Step at its integer boundary. The first and final charts hold outside the sequence. Reduced motion snaps to authored charts. Position controls move through the same window-scroll mapping; they do not start a second animation clock.

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
