# Component API

Import components from `./src/components/story.jsx` in a root-level MDX document. These are application components, not VisDelta exports.

## Hero

`<Hero eyebrow="Optional label">…Markdown…</Hero>` provides the opening editorial section and scroll cue.

## Chapter

`<Chapter id="context">…Markdown…</Chapter>` provides a text section. The optional id can be used as a link target. Ordinary MDX supports imported components, images, links, expressions and fenced code.

## Scrolly

```mdx
<Scrolly id="trend" title="A shared picture" states={states} layout="left" hold={0.45}>
  <Step>First state.</Step>
  <Step>Second state.</Step>
</Scrolly>
```

| Prop | Contract |
| --- | --- |
| `id` | Required nonempty string; authors must keep ids unique within the document. |
| `title` | Required chart/section label. |
| `states` | Required nonempty array of native VisDelta states, in authored order. Keep it stable by declaring it in a module. Adjacent states must form a supported VisDelta transition. |
| `layout` | `left` (default) or `right`, indicating chart placement on wide containers. Both stack chart before text on narrow containers. |
| `hold` | Finite fraction in `[0,1)`, default `0.45`. Each interval holds its source state for this fraction, then transitions to the next state. |
| children | Exactly one direct `Step` per state. No conditional registration or implicit index-derived highlighting. |

A single state uses a held `transition(state,state)`; two or more use `sequence(states)`. The application clamps progress to `0..states.length-1`. Every authored boundary maps to the corresponding integer. A section holds its first state before its first anchor and its final state after its last anchor. Reduced-motion preference snaps to the nearest authored state.

The position slider and Back to start move the window to the corresponding scroll position. They do not start a competing animation clock. Numbered step links seek the matching authored boundary. Normal scrolling resumes immediately.

## Step

`<Step>…Markdown…</Step>` holds one state's narrative. Place blank lines around Markdown blocks inside JSX. A step does not accept chart configuration; change the native state instead.

## Native state modules

```js
import { line } from 'visdelta';
const base = line(rows).datumKey('id')
  .x('year', { type: 'quantitative' })
  .y('value', { domain: [0, 120] })
  .key(['year', 'region'])
  .breakdown('region').color('region');
export const states = [base, base.highlight({ region: 'Inner' }), base];
```

`highlight` changes emphasis, `where` changes membership, and `focus` changes the camera. These distinctions are owned by VisDelta. There is no application wrapper mirroring its builder API.
