# VisDelta integration snapshot

This repository consumes `visdelta-0.4.3-dev.scrollytale.1.tgz` through a relative `file:` dependency and the npm lockfile. `npm ci` requires no sibling checkout, source alias or temporary path.

This is an **unpublished, private integration snapshot**, based on npm 0.4.2 plus the committed runtime fix at VisDelta commit `a99853a7a89ee6dd56926faea4384720b9cc6d3b`. It is not the original npm 0.4.2 package and has not been released to npm.

The fix binds runtime context to the stable chart root, rather than the preparation host from which a sequence detaches it. This preserves chart-scoped fonts and tokens during activation/resize. Starter's independent static-versus-sequence tests retain the legend geometry assertions that exposed the issue.

SHA-256:

```text
d90654f2c1f7577721dd2a42e44d482753bd98ab7922a626d1dd9763e3fc9739
```

Machine-readable provenance is in `visdelta-snapshot.json`, and the package's own `visdeltaSnapshot` manifest identifies the source commit and distribution contents hash. `npm test` checks the vendored bytes and installed manifest against this provenance.

When a corresponding version is published and verified, replace this file dependency explicitly and rerun the installed-consumer/browser gates. Do not silently substitute registry 0.4.2, which fails the legend regression.
