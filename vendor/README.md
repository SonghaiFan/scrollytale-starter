# VisDelta integration snapshot

The active dependency is `visdelta-0.4.3-dev.scrollytale.2.tgz`, consumed through a relative `file:` dependency and the npm lockfile. `npm ci` requires no sibling checkout, source alias or temporary path. This is an **unpublished, private integration snapshot**, based on npm 0.4.2.

The `.2` snapshot records VisDelta commit `ab51ff2faf454b618dec10fa7a1f96e6541d1ca6`. Compared with `.1`, its only distribution payload change is `dist/visdelta.css`: Paper explicitly binds its neutral mark ink to its own foreground color. This keeps neutral marks legible on Paper's light surface when the surrounding page is dark. Authored constant colors, ranges and schemes remain unchanged.

The original `.1` archive remains unchanged for provenance. It contains the runtime chart-root scope fix at `a99853a7a89ee6dd56926faea4384720b9cc6d3b`: chart-scoped fonts and tokens remain attached to the chart root when a sequence moves it out of a preparation host. `.2` retains that exact JavaScript payload. The independent static-versus-sequence tests retain the legend geometry assertions that exposed the issue.

Active SHA-256:

```text
94a9b2c1edb9b729a5e255ed2e8425dccdda77fae354a3a070ef202a7a924188
```

Machine-readable provenance is in `visdelta-snapshot.json`. The package's `visdeltaSnapshot` manifest identifies its source commit and distribution contents hash. `npm test` checks vendored bytes and the installed manifest against this provenance.

When a corresponding version is published and verified, replace the file dependency explicitly and rerun the installed-consumer/browser gates. Do not silently substitute registry 0.4.2, which fails the legend regression.
