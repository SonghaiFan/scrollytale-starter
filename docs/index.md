# Scrollytale

Write Markdown and put a native VisDelta chart on each Step.

```mdx
import { bar } from 'visdelta'

export const chart = bar([
  { region: 'North', revenue: 18 },
  { region: 'South', revenue: 12 },
  { region: 'West', revenue: 9 },
]).x('region').y('revenue')

<Scrolly>
  <Step chart={chart}>Compare everyone.</Step>
  <Step chart={chart.highlight({ region: 'North' })}>Look north.</Step>
  <Step chart={chart}>Return to everyone.</Step>
</Scrolly>
```

Scrolly and Step are already available in story MDX. Each chart is complete and independent; returning to `chart` clears the highlight. No additional states list or technical id is required.

## Start

```sh
npm ci
npm run dev
```

Read at `/`, edit the starter at `/authoring`, or explore the optional four-chart story at `/examples/housing`.

- [Authoring workflow](./authoring.md)
- [Component API](./reference.md)
- [Architecture and verification](./architecture.md)
